// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import { getConnection } from '../../../lib/db';


export async function POST(request) {

  try{

    const { md_idx, target_wallet } = await request.json();

    const connection = await getConnection();

    
    if(target_wallet != ''){

      const sql = `
    
        SELECT idx, user_idx, name, email, address, reg_date, is_main, active

          from tbl_pth_wallet_info

        where user_idx = '${md_idx}' and active = 'O' order by is_main asc;

      `;


      const [rows, fields] = await connection.execute(sql);
      
      const sql_history = `
      
        select 

          user_idx, wallet_idx, from_address, to_address, amount, memo, tx_id, update_date 

        from tbl_pth_transfer where wallet_idx = '${target_wallet}' order by update_date desc limit 100 ;

      `;

      const [rows_history, fields_history] = await connection.execute(sql_history);

      const response = NextResponse.json({ 
        
        result: 'success',
        result_data : rows,
        result_historydata : rows_history,

      });

      console.log(sql_history);

      connection.release(); // 연결 반환
    
      return response;
      
    }else{

      const sql = `
    
        SELECT idx, user_idx, name, email, address, reg_date, is_main, active

          from tbl_pth_wallet_info

        where user_idx = '${md_idx}' and active = 'O' order by is_main asc;

      `;

      const [rows, fields] = await connection.execute(sql);
      
      const response = NextResponse.json({ 
        
        result: 'success',
        result_data : rows,
        result_historydata : [],
      });

      connection.release(); // 연결 반환
    
      return response;

    }
      
  }catch(error){

    console.log(error);

  }

}