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
        M.push_key,
        FORMAT(M.mb_point, 0) AS mb_point, 
        DATE_FORMAT(M.mb_today_login , '%Y-%m-%d %H:%i:%S') as mb_today_login, 
        DATE_FORMAT(M.mb_open_date , '%Y-%m-%d %H:%i:%S') as mb_datetime,
        if(W.new_address != '', W.new_address, W.address) as mb_wallet,
        (if((select block_type from g5_member_blacklist where mb_no = M.mb_no) is null, 'N', 'Y')) as block_yn,
        (if((select address from tbl_pth_lock where address = W.address) is null, 'N', 'Y')) as lock_yn,
        CONCAT_WS('|', K.kyc_path, K.kyc_path2, K.kyc_path3) as mb_images

        
      FROM g5_member as M left outer join tbl_pth_wallet_info as W on M.mb_no = W.user_idx  and W.is_main = 'O' and W.active = 'O'

      left outer join g5_member_kyc as K on M.mb_no = K.mb_user_key
      
      where M.mb_leave_date = '';

    `;

    const [rows, fields] = await connection.execute(sql);


    const sql_count = `
    
      select count(*) as total_count from g5_member;
    
    `;

    const [rows_count, fields_count] = await connection.execute(sql_count);

    const sql_leave_count = `
    
      select count(*) as leave_count from g5_member where mb_leave_date != '';
    
    `;

    const [rows_leave_count, fields_leave_count] = await connection.execute(sql_leave_count);

    const sql_black_count = `
    
      select count(*) as black_count from g5_member_blacklist where delete_flag = 'N';
    
    `;

    const [rows_black_count, fields_black_count] = await connection.execute(sql_black_count);

    /*
    const sql_lock_count = `
    
      select count(*) as lock_count from tbl_pth_lock;
    
    `;

    const [rows_lock_count, fields_lock_count] = await connection.execute(sql_lock_count);
    */



    const response = NextResponse.json({ 
        
        result: 'success',
        result_data : rows,
        total_count : rows_count[0].total_count,
        leave_count : rows_leave_count[0].leave_count,
        black_count : rows_black_count[0].black_count,

      });

      connection.release(); // 연결 반환
    
      return response;
    
  
  }catch(error){

    console.log(error);

  }

}