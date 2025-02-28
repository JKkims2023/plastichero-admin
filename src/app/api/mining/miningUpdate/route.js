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

    const { node_no, status } = await request.json();

    if(status == ''){

      connection.release(); // 연결 반환

      return NextResponse.json({ 
        
        result: 'error',
        result_data : 'status is empty',
      },{status: 401});

    }


    const sql = `
    
     UPDATE g5_node_list SET 
     
      stop_yn = '${status}'

     where node_no = ${node_no} 
     

    `;

    console.log(sql);

    const [rows, fields] = await connection.execute(sql);

    const response = NextResponse.json({ 
        
        result: 'success',
        result_data : rows,

      });

      connection.release(); // 연결 반환
    
      return response;
    
  
  }catch(error){

    console.log(error);

    connection.release(); // 연결 반환

    return NextResponse.json({ 
        
      result: 'error',
      result_data : error,
    },{status: 401});

  }

}