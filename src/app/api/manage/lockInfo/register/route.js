// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { SignJWT, jwtVerify } from 'jose';
import { TextEncoder, TextDecoder } from 'util'; // util 모듈에서 가져오기
import { Buffer } from 'buffer'; // buffer 모듈 import
import { getConnection } from '../../../../lib/db';


export async function POST(request) {

  try{

    const { address, memo, unlock_date, lock_type, lock_balance, user_idx, wallet_idx } = await request.json();

    const connection = await getConnection();




    const sql = `
    
      INSERT INTO tbl_pth_lock
      (
      address, 
      memo, 
      reg_date, 
      unlock_date, 
      lock_type, 
      lock_balance,
      wallet_idx,
      user_idx
      )
      VALUES(
      '${address}', 
      '${memo}', 
      CURRENT_TIMESTAMP, 
      '${unlock_date}', 
      '${lock_type}', 
      '${lock_balance}',
      '${wallet_idx}',
      '${user_idx}'
      );

      `;

    console.log('sql : ', sql);

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