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

    const sql = `
    
      SELECT 
      
        B.blacklist_no,
        B.block_type,
        if(B.block_type = '0', '불법접근', if(B.block_type = '1', '해킹시도', if(B.block_type = '9', '기타', ''))) as block_type_text,
        B.memo,
        B.reg_date,
        B.expire_date,
        M.mb_no, 
        M.mb_id, 
        M.mb_name, 
        M.mb_email, 

        DATE_FORMAT(M.mb_today_login , '%Y-%m-%d %H:%i:%S') as mb_today_login, 
        W.address as mb_wallet

        
      FROM g5_member_blacklist as B left outer join g5_member as M on B.mb_no = M.mb_no left outer join tbl_pth_wallet_info as W on M.mb_no = W.user_idx
      
      where B.delete_flag = 'N' and M.mb_leave_date = '' and W.is_main = 'O' and W.active = 'O'
      
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