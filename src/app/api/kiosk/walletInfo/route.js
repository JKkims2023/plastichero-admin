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

    const { user_idx } = await request.json();


    const connection = await getConnection();

    const sql = `
    
      SELECT 

      idx,
      name,
      email,
      address,
      new_address,
      user_idx,
      active,
      is_main

      from tbl_pth_wallet_info

      where active = 'O' and user_idx = ${user_idx}

      order by idx desc;


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