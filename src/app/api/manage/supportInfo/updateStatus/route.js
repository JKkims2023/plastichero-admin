// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { SignJWT, jwtVerify } from 'jose';
import { TextEncoder, TextDecoder } from 'util'; // util 모듈에서 가져오기
import { Buffer } from 'buffer'; // buffer 모듈 import
import { getConnection } from '../../../../lib/db';
import axios from 'axios';

export async function POST(request) {

  try{

    const { support_no, support_comment, support_status, mb_no} = await request.json();

    const connection = await getConnection();

    const sql = `
    
      UPDATE g5_support_main set

      support_reply = '${support_comment}',
      support_status = '${support_status}'
      
      where support_no = ${support_no}

    `;

    const [rows, fields] = await connection.execute(sql);

    const sql_user = `
    
      SELECT 
      
        push_key,
        push_status
      
      FROM g5_member
      
      WHERE mb_no = ${mb_no}

    `;

    const [rows_user, fields_user] = await connection.execute(sql_user);

    const token = rows_user[0].push_key;
    
    

//    const result = await axios.post('https://port-0-plastichero-batch-m90know96390d9a9.sel4.cloudtype.app/' + 'api/push/send', {
  
if(rows_user[0].push_status == 'Y'){

  const result = await axios.post('https://port-0-plastichero-batch-maa8f8088cfc79d3.sel4.cloudtype.app/' + 'api/push/send', {
  
    token: token,
      title: '고객지원 답변 완료',
      body: '요청하신 문의에 대한 답변이 등록되었습니다.',
      data: 'PlasticHero',

    });


    const response = NextResponse.json({ 
        
        result: 'success',
        result_data : rows,

      });

      connection.release(); // 연결 반환
    
      return response;
   

    }else{

      const response = NextResponse.json({ 
        
        result: 'success',
        result_data : rows,

      });

      connection.release(); // 연결 반환
    
      return response;
  
    }

       
  
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