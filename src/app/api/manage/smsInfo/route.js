// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import { getConnection } from '../../../lib/db';


export async function POST(request) {

  try{

    const { filterInfo, fromDate, toDate } = await request.json();

    const connection = await getConnection();

    const sql = `
    
      SELECT 
      
        A.auth_no, 
        A.auth_type,
        if(A.auth_type = '0', '회원가입', if(A.auth_type = '1', '아이디 찾기', if(A.auth_type = '2', '비밀번호 변경', '출금비밀번호 변경'))) as auth_type_text, 
        A.mb_phone, 
        A.auth_info, 
        A.auth_result, 
        DATE_FORMAT(A.req_date , '%Y-%m-%d %H:%i:%S') as reg_dt,
        M.mb_id,
        M.mb_name
    
        from g5_auth_info as A left outer join g5_member as M on A.auth_mb_no = M.mb_no

      
      order by A.req_date desc;

    `;

    const [rows, fields] = await connection.execute(sql);

    const response = NextResponse.json({ 
        
        result: 'success',
        result_data : rows,

      });

      connection.release(); // 연결 반환
    
      return response;
    
  
  }catch(error){

    console.log(error);

  }

}