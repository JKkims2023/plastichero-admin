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

    const { md_idx, wallet_address } = await request.json();

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
        if(type = 0, 'normal', if(type = 1, 'save plastic',if(type = 2, 'point swap', if(type = 3, 'eth pth swap transfer', if(type = 4, 'ai owner transfer', if(type = 5, 'cancel swap', 'signup reward')))))) as type_name,
        DATE_FORMAT(update_date , '%Y-%m-%d %H:%i:%S') as update_date


      from tbl_pth_transfer where wallet_idx = '${md_idx}' 
      or to_address = '${wallet_address}'
      or from_address = '${wallet_address}'
      order by update_date desc;

    `;

    console.log('sql : ' + sql);

    const [rows, fields] = await connection.execute(sql);

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