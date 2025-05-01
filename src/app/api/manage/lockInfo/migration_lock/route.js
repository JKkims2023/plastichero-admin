// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { SignJWT, jwtVerify } from 'jose';
import { TextEncoder, TextDecoder } from 'util'; // util 모듈에서 가져오기
import { Buffer } from 'buffer'; // buffer 모듈 import
import { getConnection } from '../../../../lib/db';



export async function POST(request) {

  try{

    const { pagingIdx, fromDate, toDate } = await request.json();

    const connection = await getConnection();

    const sql = `
    
      SELECT 

        L.idx, 
        L.address,
        W.new_address,
        L.memo,
        L.lock_type,
        L.lock_balance,
        if(L.lock_type = '0', '지갑','금액') as lock_type_text,
        DATE_FORMAT(L.reg_date , '%Y-%m-%d %H:%i:%S') as reg_date,  
        DATE_FORMAT(L.unlock_date , '%Y-%m-%d %H:%i:%S') as unlock_date, 
        W.user_idx,
        W.email,
        M.mb_id,
        M.mb_name,
        M.mb_email


      FROM tbl_pth_lock as L left outer join tbl_pth_wallet_info as W ON L.address = W.address left outer join g5_member as M ON W.user_idx = M.mb_no
      WHERE L.delete_flag = 'N'
      
      order by reg_date desc;

    `;

    const [rows, fields] = await connection.execute(sql);

    for(let i = 0; i < rows.length; i++){

      const row = rows[i].address;

      const sql_select = `
      
        select user_idx, idx from tbl_pth_wallet_info where address = '${row}';

      `;

      const [rows_select, fields_select] = await connection.execute(sql_select);

      if(rows_select.length > 0){
      
        const user_idx = rows_select[0].user_idx;
        const wallet_idx = rows_select[0].idx;

        const sql_update = `

        update tbl_pth_lock set 
        
        wallet_idx = ${wallet_idx},
        user_idx = ${user_idx}

        where address = '${row}';

      `;

      const [rows_update, fields_update] = await connection.execute(sql_update);

      console.log(rows_update.affectedRows);

      }
      

    }

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