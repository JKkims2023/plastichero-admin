// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import { getConnection } from '../../../lib/db';


export async function POST(request) {

  try{

    const { pagingIdx, filterInfo, fromDate, toDate } = await request.json();

    const connection = await getConnection();

    const sql_datetime = `and T.reg_date >= '${fromDate}' and T.reg_date < '${toDate}' `;

 
    const sql = `
    
     SELECT

      T.user_idx, 
      T.wallet_idx,
      T.from_address,
      T.to_address,
      T.amount,
      T.memo,
      T.tx_id,
      T.reg_date,
      DATE_FORMAT(T.reg_date , '%Y-%m-%d %H:%i:%S') as reg_date_text, 
      T.update_date,
      T.type,
      W.address,
      W.user_idx,
      M.mb_id

      from tbl_pth_transfer as T left outer join tbl_pth_wallet_info as W ON T.to_address = W.address and W.active = 'O'

      left outer join g5_member as M ON W.user_idx = M.mb_no

      where  T.type = '1' ${sql_datetime}

      order by T.reg_date desc;

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