// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import mysql from 'mysql2/promise';

// 날짜 변환 함수 (위에 정의된 함수)
function excelDateToJSDate(serial) {
  const utc_days  = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);

  const fractional_day = serial - Math.floor(serial) + 0.0000001;

  let total_seconds = Math.floor(86400 * fractional_day);

  const seconds = total_seconds % 60;

  total_seconds -= seconds;

  const hours = Math.floor(total_seconds / (60 * 60));
  const minutes = Math.floor(total_seconds / 60) % 60;

  date_info.setHours(hours);
  date_info.setMinutes(minutes);
  date_info.setSeconds(seconds);

  return date_info;
}


export async function POST(request) {

  if (request.method === 'POST') {
    try {
      // 1. 엑셀 파일 읽기

      console.log(request);

      
       // FormData로 파일 읽기
    const formData = await request.formData();
    const file = formData.get('excelFile');
    
    if (!file) {
      return NextResponse.json({ message: '파일이 업로드되지 않았습니다.' }, { status: 400 });
    }

    // ArrayBuffer로 변환
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });


  //    const fileBuffer = file.data; // 파일 데이터 버퍼
  //    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0]; // 첫 번째 시트 이름 가져오기
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);

      // 2. MySQL 연결 설정
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
      });

      // 3. 데이터베이스에 INSERT
      // 예시: `your_table` 테이블에 `column1`, `column2` 열이 있다고 가정



      for (const row of data) {
        // row는 각 행의 데이터를 담고 있는 객체

        const values = [row.__EMPTY, row.__EMPTY_1, row.__EMPTY_2, excelDateToJSDate(row.__EMPTY_3)]; // 엑셀 열 이름에 맞게 수정

        let dateValue = values[3];

          const year = dateValue.getFullYear();
          const month = String(dateValue.getMonth() + 1).padStart(2, '0');
          const day = String(dateValue.getDate()).padStart(2, '0');
          const hours = String(dateValue.getHours()).padStart(2, '0');
          const minutes = String(dateValue.getMinutes()).padStart(2, '0');
          const seconds = String(dateValue.getSeconds()).padStart(2, '0');

          dateValue = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;


        const insertQuery = `INSERT INTO g5_node_member 
      
              (mb_id, mb_pw, mb_name, mb_email, mb_invite_code, wallet_address, reg_date)
              VALUES('id', 'pw', 'name', '${values[0]}', '${values[2]}', '${values[1]}', '${dateValue}');
        `;

        console.log(insertQuery);  

        await connection.execute(insertQuery);

      }

      // 4. 연결 종료
      await connection.end();

      return NextResponse.json({ message: 'Data imported successfully!' }, { status: 200 });

    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: 'Error importing data', error: error.message }, { status: 500 });
    }
  } else {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
  }

}

// Next.js API Route에서 파일 업로드를 처리하기 위한 설정
export const config = {
  api: {
    bodyParser: false, // bodyParser 비활성화 (파일 업로드 시 필요)
  },
};