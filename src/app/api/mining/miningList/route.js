// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { SignJWT, jwtVerify } from 'jose';
import { TextEncoder, TextDecoder } from 'util'; // util 모듈에서 가져오기
import { Buffer } from 'buffer'; // buffer 모듈 import
import { getConnection } from '../../../lib/db';


export async function POST(request) {

  try{

    const { fromDate } = await request.json();


    const connection = await getConnection();

    const sql = `
    
     SELECT 

        H.mining_no,
        H.node_no,
        H.mining_amount,
        H.mining_type,
        H.result_key,
        H.tx_hash,
        H.round_date,
        H.mainnet_request_status,
        H.result_msg,
        DATE_FORMAT(H.req_date, '%Y-%m-%d %H:%i:%S') as req_date, 
        H.update_date,
        H.done_yn,
        if(H.mainnet_request_status = 'S','채굴완료',if(H.mainnet_request_status = 'F','채굴실패','채굴중')) as done_status,
        N.kc_kiosk_id as node_name,
        N.kc_kiosk_id,
        W.address


      from g5_mining_history as H inner join g5_kiosk as N ON H.node_no = N.kc_no
      inner join tbl_pth_wallet_info as W ON N.wallet_idx = W.idx  
      where H.round_date = '${fromDate}'
      order by N.kc_kiosk_id

    `;

    const [rows, fields] = await connection.execute(sql);


    const sql_company_list = `
    
      SELECT 
        
        node_company_no,
        node_name,
        mining_amount
        
      FROM g5_node_company_list 
      
      WHERE 
        
      delete_flag = 'N' order by order_idx
    
    `;

    const [rows_company_list, fields_company_list] = await connection.execute(sql_company_list);

    const sql_schedule_info = `
    
      SELECT 

      schedule_no,
      round_date,
      successCount,
      failCount,
      orderCount,
      orderAmount,
      scheduled_yn,
      spreaded_yn

      FROM g5_mining_batch_schedule

      where round_date = '${fromDate}'
      
    
    `;

    const [rows_schedule_info, fields_schedule_info] = await connection.execute(sql_schedule_info);

    console.log(rows_schedule_info);

    const response = NextResponse.json({ 
        
        result: 'success',
        result_data : rows,
        result_company_list : rows_company_list,
        result_schedule_info : rows_schedule_info,

      });

      connection.release(); // 연결 반환
    
      return response;
    
  
  }catch(error){

    console.log(error);

    return NextResponse.json({ message: error.message }, { status: 401 });
  
  }

}