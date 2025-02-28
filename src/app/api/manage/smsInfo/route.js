// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import { getConnection } from '../../../lib/db';


export async function POST(request) {

  try{

    const { filterInfo, fromDate, toDate } = await request.json();

    const connection = await getConnection();

    const sql = `
    
      SELECT 
      
        A.valid_phone_idx, 
        A.auth_type,
        if(A.auth_type = '0', '회원가입', if(A.auth_type = '1', '아이디 찾기', if(A.auth_type = '2', '비밀번호 변경', '출금비밀번호 변경'))) as auth_type_text, 
        A.phone, 
        A.code, 
        A.status, 
        DATE_FORMAT(A.reg_dt , '%Y-%m-%d %H:%i:%S') as reg_dt,
        M.mb_id,
        M.mb_name
        
        from tbl_valid_phone as A left outer join g5_member as M on A.phone = M.mb_hp
      
      order by A.reg_dt desc;

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