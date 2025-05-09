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

    const { mb_idx } = await request.json();

    const connection = await getConnection();

    const sql = `
    
      SELECT 
      
        idx,
        address,
        new_address,
        recovery_amount,
        useable_swap_amount,
        recovery_status,
        migration_txid

      from tbl_pth_wallet_info

      where user_idx = '${mb_idx}' and active = 'O'
      order by reg_date desc;

    `;

    const [rows, fields] = await connection.execute(sql);

    const sql_summary = `
    
      SELECT 
      
      recovery_status

      from g5_member where mb_no = '${mb_idx}'

    `;

    const [summary, fields_summary] = await connection.execute(sql_summary);

    const response = NextResponse.json({ 
        
        result: 'success',
        result_data : rows,
        result_migration_status : summary[0].recovery_status

      });

      connection.release(); // 연결 반환
    
      return response;
    
  
  }catch(error){

    console.log(error);

  }

}