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

    const { pagingIdx, filterInfo, fromDate, toDate } = await request.json();

    const connection = await getConnection();

    const sql = `
    
     SELECT 
     
      N.node_no, 
      N.mb_no, 

      N.kc_kiosk_id, 
      N.node_name, 
      N.mining_amount, 
      N.stop_yn,
      N.node_type,
      N.wallet_idx,
      if(N.node_type = '0', '그룹보유', if(N.node_type = '1', '키오스크', '개별판매')) as node_type_text,
      if(N.stop_yn = 'Y', '중지', '운영') as stop_yn_text,
      N.buy_date, 
      N.reg_date, 
      N.update_date, 
      N.delete_flag,
      M.mb_name,
      M.mb_id,
      M.mb_email,
      W.address as node_address

      FROM g5_node_list as N left outer join tbl_pth_wallet_info as W on W.idx = N.wallet_idx left outer join g5_member as M on M.mb_no = N.mb_no

    where 1=1 and N.delete_flag = 'N'

    order by reg_date desc;

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