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

    const { pagingIdx, fromDate } = await request.json();


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
        DATE_FORMAT(H.req_date, '%Y-%m-%d %H:%i:%S') as req_date, 
        H.update_date,
        H.done_yn,
        if(H.done_yn = 'S','채굴완료',if(H.done_yn = 'F','채굴실패','채굴중')) as done_status,
        N.node_name,
        K.kc_kiosk_id,
        W.address


      from g5_mining_history as H inner join g5_node_list as N ON H.node_no = N.node_no and N.delete_flag = 'N'
      inner join tbl_pth_wallet_info as W ON N.wallet_idx = W.idx left outer join g5_kiosk as K ON N.kc_kiosk_id = K.kc_no 
      where H.round_date = '${fromDate}'
      order by N.kc_kiosk_id, N.node_name

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

    return NextResponse.json({ message: error }, { status: 401 });
  
  }

}