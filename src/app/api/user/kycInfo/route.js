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

    const connection = await getConnection();

    let sql_filter = '';

    if(filterInfo != ''){

      sql_filter = `and approval_yn = '${filterInfo}'`;

    }

    const sql = `
    
      SELECT 
      
        key_no, 
        mb_user_key, 
        mb_id, 
        if(kyc_type = '0', '주민등록증', if(kyc_type = '1', '면허증', '여권')) as kyc_type, 
        kyc_path,
        kyc_path2,
        kyc_path3, 
        kyc_name, 
        kyc_birth, 
        approval_yn,
        if(approval_yn = 'Y', '승인완료', if(approval_yn = 'N', '승인거부', '승인대기')) as approval_yn_text, 
        reject_comment, 
        DATE_FORMAT(reg_date , '%Y-%m-%d %H:%i:%S') as reg_date 
        
        from g5_member_kyc

        where 1=1 ${sql_filter}
      
      order by reg_date desc
      
      ;

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