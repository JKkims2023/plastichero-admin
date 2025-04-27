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

    const { filterInfo } = await request.json();


    const connection = await getConnection();

    const sql_node_member = `
    
    
        SELECT
      
        DATE_FORMAT(N.mb_datetime , '%Y-%m-%d %H:%i:%S') as mb_datetime,
        N.mb_email,
        N.mb_name, 
        N.mb_id,
        W.address as real_address,
        W.email as real_email,
        W.idx as wallet_idx,
        W.user_idx,
        if(W.address is null, 'Y', 'N') as not_match_user,
        if(W.address is null, '미 매칭 사용자', '매칭 사용자') as not_match_user_text        

      from g5_member as N  inner join tbl_pth_wallet_info as W ON N.mb_no = W.user_idx and W.active = 'O' and W.is_main = 'O'

      where N.mb_leave_date = '' and N.mb_id like '%${filterInfo}%' and N.mb_kiosk_owner = 'Y'
      order by N.mb_datetime desc;


    `;


    const [rows_node_member, fields_node_member] = await connection.execute(sql_node_member);


    const response = NextResponse.json({ 
        
        result: 'success',
        result_node_member_data : rows_node_member

      });

      connection.release(); // 연결 반환
    
      return response;
    
  
  }catch(error){

    console.log(error);

  }

}