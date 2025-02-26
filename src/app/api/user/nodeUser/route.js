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
          mb_email,
          mb_invite_code,
          mb_invite_code as invite_code,
          wallet_address


          from g5_node_member as N

        order by N.reg_date desc
        
      ;

    `;


 //   (select mb_no from g5_member where mb_email = N.mb_email and mb_leave_date <> '' ) as mb_no,
 //   (select mb_id from g5_member where mb_email = N.mb_email and mb_leave_date <> '' ) as mb_id,
 //   (select mb_name from g5_member where mb_email = N.mb_email and mb_leave_date <> '' ) as mb_name,
 //   (select mb_hp from g5_member where mb_email = N.mb_email and mb_leave_date <> '' ) as mb_hp

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