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

    const { pagingIdx, fromDate, toDate } = await request.json();

    const connection = await getConnection();

    const sql = `
    
      SELECT 

        S.support_no,
        S.mb_no,
        S.support_type,
        IF(S.support_status = 'N','미처리','처리완료') as support_status_text,
        IF(S.support_type = '0','서비스 장애',IF(S.support_type = '1', 'AI ROBOT 장애',IF(S.support_type = '2', '제안','기타'))) as support_type_text,
        S.support_title,
        S.support_desc,
        S.support_status,
        S.support_reply,
        S.img_path1,
        S.img_path2,
        S.img_path3,
        S.movie_path,
        DATE_FORMAT(S.reg_date , '%Y-%m-%d %H:%i:%S') as reg_date,
        M.mb_id,
        M.mb_name,
        M.mb_email,
        M.mb_hp 


      FROM g5_support_main as S inner join g5_member as M ON S.mb_no = M.mb_no
      WHERE S.delete_flag = 'N' and M.mb_leave_date = ''
      
      order by reg_date desc;

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