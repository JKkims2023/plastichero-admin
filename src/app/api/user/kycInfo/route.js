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
      
        K.key_no, 
        K.mb_user_key, 
        M.mb_id, 
        M.mb_email,
        if(K.kyc_type = '0', '주민등록증', if(K.kyc_type = '1', '면허증', '여권')) as kyc_type, 
        K.kyc_path,
        K.kyc_path2,
        K.kyc_path3, 
        K.kyc_name, 
        K.kyc_birth, 
        K.approval_yn,
        if(K.approval_yn = 'Y', '승인완료', if(K.approval_yn = 'N', '승인거부', '승인대기')) as approval_yn_text, 
        K.reject_comment, 
        DATE_FORMAT(K.reg_date , '%Y-%m-%d %H:%i:%S') as reg_date,
        M.mb_hp,
        M.mb_name,
        M.mb_email
        
        from g5_member_kyc as K left outer join g5_member as M on K.mb_user_key = M.mb_no

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