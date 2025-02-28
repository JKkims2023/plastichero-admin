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

    const {pagingIdx} = await request.json();

    const sql = `
    
      SELECT 
      
        user_no, 
        user_key, 
        user_id, 
        user_pw, 
        user_type,
        if(user_type = 'A', '총괄관리자', if(user_type = 'M', '어드민', '일반사용자')) as user_type_text,
        user_name,
        menu_auth,
        delete_flag,
        DATE_FORMAT(create_date, '%Y-%m-%d %H:%i:%S') as create_date  
      
      FROM tbl_system_user_main where delete_flag = 'N' order by user_no desc;
        
    `;

    const [rows, fields] = await connection.execute(sql);

    console.log(rows);
    
    const response = NextResponse.json({ 
        
        result: 'success',
        result_data : rows,

      });

      connection.release(); // 연결 반환
    
      return response;
    
  
  }catch(error){

    console.log(error);
    connection.release(); // 연결 반환
    return NextResponse.json({ message: '사용자 등록 처리 중 오류가 발생했습니다.' }, { status: 500 });

  }

}