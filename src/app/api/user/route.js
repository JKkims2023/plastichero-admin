// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { SignJWT, jwtVerify } from 'jose';
import { TextEncoder, TextDecoder } from 'util'; // util 모듈에서 가져오기
import { Buffer } from 'buffer'; // buffer 모듈 import
import { getConnection } from '../../lib/db';


export async function POST(request) {

  try{

    const { pagingIdx, filterInfo } = await request.json();

    console.log(pagingIdx);
    console.log(filterInfo);

    const connection = await getConnection();

    const sql = `
    
      SELECT 
      
        M.mb_no, 
        M.mb_id, 
        M.mb_name, 
        M.mb_email, 
        M.mb_hp, 
        M.mb_point, 
        M.mb_today_login, 
        M.mb_datetime 
        
      FROM g5_member as M 
      
      where mb_leave_date <> '' 
      
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