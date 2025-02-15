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

    const { pagingIdx, filterInfo } = await request.json();

    console.log(pagingIdx);
    console.log(filterInfo);

    const connection = await getConnection();

    const sql = `
    
      SELECT 

        K.kc_no, 
        K.kc_kiosk_id, 
        K.kc_engineer, 
        K.kc_zip1, 
        K.kc_zip2, 
        K.kc_addr1, 
        K.kc_addr2, 
        K.kc_addr3, 
        CONCAT(K.kc_addr1, ' ', K.kc_addr2, ' ', K.kc_addr3) as kc_addr,
        K.kc_addr_jibeon, 
        K.kc_lat, 
        K.kc_lng, 
        K.kc_start, 
        K.kc_end, 
        K.kc_datetime, 
        K.kg_no,
        K.kctry_no,
        K.owner_id,
        if(K.owner_key = 0, '판매전', '판매중') as sell_status,
        (select kc_name from g5_kiosk_country where kctry_no = K.kctry_no) as kc_name

        FROM ecocentre0.g5_kiosk as K;

      
      ;

    `;

    const [rows, fields] = await connection.execute(sql);

    console.log('total length : ' + rows.length );

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