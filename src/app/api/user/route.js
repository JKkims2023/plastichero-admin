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
        FORMAT(M.mb_point, 0) AS mb_point, 
        DATE_FORMAT(M.mb_today_login , '%Y-%m-%d %H:%i:%S') as mb_today_login, 
        DATE_FORMAT(M.mb_open_date , '%Y-%m-%d %H:%i:%S') as mb_datetime,
        W.address as mb_wallet

        
      FROM g5_member as M left outer join tbl_pth_wallet_info as W on M.mb_no = W.user_idx
      
      where M.mb_leave_date = '' and W.is_main = 'O' and W.active = 'O'
      
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