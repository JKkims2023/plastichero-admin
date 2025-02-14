import * as XLSX from 'xlsx';
import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // 1. 엑셀 파일 읽기
      const file = req.files ? req.files.excelFile : null; // 'excelFile'은 폼 데이터의 필드 이름
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const fileBuffer = file.data; // 파일 데이터 버퍼
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
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
      const insertQuery = `INSERT INTO g5_node_member 
      
           (mb_id, mb_pw, mb_name, mb_email, mb_invite_code, wallet_address, reg_date)
            VALUES('id', 'pw', 'name', '?', '?', '?', '?');
      `;


      for (const row of data) {
        // row는 각 행의 데이터를 담고 있는 객체
        const values = [row.A, row.B, row.C, row.D]; // 엑셀 열 이름에 맞게 수정
        await connection.execute(insertQuery, values);
      }

      // 4. 연결 종료
      await connection.end();

      res.status(200).json({ message: 'Data imported successfully!' });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error importing data', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

// Next.js API Route에서 파일 업로드를 처리하기 위한 설정
export const config = {
  api: {
    bodyParser: false, // bodyParser 비활성화 (파일 업로드 시 필요)
  },
};