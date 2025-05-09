// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { SignJWT, jwtVerify } from 'jose';
import { TextEncoder, TextDecoder } from 'util'; // util 모듈에서 가져오기
import { Buffer } from 'buffer'; // buffer 모듈 import
import { getConnection } from '../../../lib/db';


export async function POST(request) {

  const connection = await getConnection();
  
  try{

    const { mb_no, kiosk_owner } = await request.json();

    const sql = `
    
      UPDATE g5_member set
      mb_kiosk_owner = '${kiosk_owner}'
      where mb_no = '${mb_no}'


    `;

    const [rows, fields] = await connection.execute(sql);

    const response = NextResponse.json({ 
        
        result: 'success',

      });

      connection.release(); // 연결 반환
    
      return response;
    
  
  }catch(error){

    console.log(error);

    connection.release(); // 연결 반환

    const response = NextResponse.json({ 
        
      result: 'fail',
      error: error.message

    });

    return response;


  }

}