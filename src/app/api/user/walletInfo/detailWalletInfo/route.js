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

    const { md_idx } = await request.json();

    const connection = await getConnection();

    const sql = `
    
      select 

        user_idx, 
        wallet_idx, 
        from_address, 
        to_address, 
        amount, 
        memo, 
        tx_id,
        DATE_FORMAT(update_date , '%Y-%m-%d %H:%i:%S') as update_date  


      from tbl_pth_transfer where wallet_idx = '${md_idx}' order by update_date desc limit 100 ;

    `;

    const [rows, fields] = await connection.execute(sql);

    console.log('total length : ' + rows.length );

    const response = NextResponse.json({ 
        
        result: 'success',
        result_historydata : rows,

      });

      connection.release(); // 연결 반환
    
      return response;
    
  
  }catch(error){

    console.log(error);

  }

}