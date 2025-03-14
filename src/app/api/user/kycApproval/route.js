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

    const { approval_yn, reject_comment, key_no } = await request.json();

    const connection = await getConnection();

    let sql_comment = '';

    if(approval_yn == 'N'){

      sql_comment = `, reject_comment = '${reject_comment}' `;

    }

    const sql = `
    
      UPDATE g5_member_kyc

      SET approval_yn = '${approval_yn}'
      ${sql_comment}

      WHERE key_no = ${key_no}
      
      order by reg_date desc
      
      ;

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