// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import { getConnection } from '../../../lib/db';


export async function POST(request) {

  try{

    const { filterInfo, fromDate, toDate } = await request.json();

    const connection = await getConnection();

    const sql = `
    
      SELECT 
      
        A.idx, 
        A.auth_type,
        if(A.auth_type = '0', '지갑생성', if(A.auth_type = '1', '지갑 불러오기', '기타')) as auth_type_text, 
        A.target, 
        A.code, 
        A.status, 
        DATE_FORMAT(A.reg_dtm , '%Y-%m-%d %H:%i:%S') as reg_dt,
        M.mb_id,
        M.mb_name
        
        from tbl_valid_code as A left outer join g5_member as M on A.target = M.mb_email
      
      order by A.reg_dtm desc;

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