// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { SignJWT, jwtVerify } from 'jose';
import { TextEncoder, TextDecoder } from 'util'; // util 모듈에서 가져오기
import { Buffer } from 'buffer'; // buffer 모듈 import
import { getConnection } from '../../../lib/db';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';


export async function POST(request) {

  try{

    const { password } = await request.json();

    const connection = await getConnection();

    const auth_id = 'ppc4497';

//  const auth_id = 'kwicmining';

    const sql = `
    
     SELECT 

      screen_pw 

    FROM g5_member

    WHERE mb_id = '${auth_id}'

    `;

    const [rows, fields] = await connection.execute(sql);

    const auth_pw = rows[0].screen_pw;
    
   const [algorithm, iterations, salt, beforeKey] = auth_pw.toString().split(':');

   const derivedKey = crypto.pbkdf2Sync(password, salt, parseInt(iterations), 24, 'sha256');

   if(derivedKey.toString('base64') == beforeKey){

      const response = NextResponse.json({ 
          
        result: 'success',
        info : 'success',

      });

      connection.release(); // 연결 반환
    
      return response;

    }else{

      const response = NextResponse.json({ 
          
          result: 'fail',
          info : '화면 잠금 비밀번호가 일치하지 않습니다.',

      });

      connection.release(); // 연결 반환
    
      return response;

    }

  
  }catch(error){

    console.log(error);

    return NextResponse.json({ message: error.message }, { status: 401 });
  
  }

}