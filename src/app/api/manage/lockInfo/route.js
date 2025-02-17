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

        L.idx, 
        L.address, 
        L.memo,
        DATE_FORMAT(L.reg_date , '%Y-%m-%d %H:%i:%S') as reg_date,  
        DATE_FORMAT(L.unlock_date , '%Y-%m-%d %H:%i:%S') as unlock_date, 
        W.user_idx,
        W.email,
        M.mb_id,
        M.mb_name,
        M.mb_email


      FROM tbl_pth_lock as L left outer join tbl_pth_wallet_info as W ON L.address = W.address left outer join g5_member as M ON W.user_idx = M.mb_no
      
      order by reg_date desc;

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

  }

}