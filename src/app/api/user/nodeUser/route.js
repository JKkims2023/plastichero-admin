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

    const { pagingIdx, filterInfo, matchInfo } = await request.json();

    const connection = await getConnection();

    const sql = `
    
      SELECT
      
        DATE_FORMAT(N.reg_date , '%Y-%m-%d %H:%i:%S') as mb_datetime,
        N.mb_email,
        N.mb_invite_code,
        N.mb_invite_code as invite_code,
        N.wallet_address,
        M.mb_name, 
        M.mb_id,
        W.address as real_address,
        W.email as real_email,
        if(W.address is null, 'Y', 'N') as not_match_user,
        if(W.address is null, '미 매칭 사용자', '매칭 사용자') as not_match_user_text        

      from g5_node_member as N left outer join tbl_pth_wallet_info as W ON BINARY(N.mb_email) = BINARY(W.email) and W.active = 'O' left outer join g5_member as M ON W.user_idx = M.mb_no 
      
      

      order by N.reg_date desc;

    `;

    // and M.mb_leave_date = ''
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