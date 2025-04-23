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

        K.kc_no, 
        K.kc_kiosk_id, 
        K.kc_engineer, 
        K.kc_zip1, 
        K.kc_zip2, 
        K.kc_addr1, 
        K.kc_addr2, 
        K.kc_addr3, 
        CONCAT(K.kc_addr1, ' ', K.kc_addr2, ' ', K.kc_addr3) as kc_addr,
        K.kc_addr_jibeon, 
        K.kc_lat, 
        K.kc_lng, 
        K.kc_start, 
        K.kc_end, 
        K.kc_datetime, 
        K.kg_no,
        K.kctry_no,
        K.owner_id,
        K.manager_mail,
        K.sell_status,
        K.wallet_idx,
        M.mb_name,
        W.address as match_address,
        if(K.sell_status = '0', '판매전', if(K.sell_status = '1', '판매중', if(K.sell_status = '3', '판매완료(운영지원금)', '판매완료(직접채굴)'))) as sell_status_text,
        (select kc_name from g5_kiosk_country where kctry_no = K.kctry_no) as kc_name

        FROM 
        
        g5_kiosk as K left outer join tbl_pth_wallet_info as W ON K.owner_id = W.email and W.active = 'O' and W.user_idx <> 2955
        left outer join g5_member as M ON W.user_idx = M.mb_no 
        
        order by K.kc_no asc;

    `;

    const [rows, fields] = await connection.execute(sql);

    const sql_node_member = `
    
    
        SELECT
      
        DATE_FORMAT(N.mb_datetime , '%Y-%m-%d %H:%i:%S') as mb_datetime,
        N.mb_email,
        N.mb_name, 
        N.mb_id,
        W.address as real_address,
        W.email as real_email,
        W.idx as wallet_idx,
        W.user_idx,
        if(W.address is null, 'Y', 'N') as not_match_user,
        if(W.address is null, '미 매칭 사용자', '매칭 사용자') as not_match_user_text        

      from g5_member as N  inner join tbl_pth_wallet_info as W ON N.mb_no = W.user_idx and W.active = 'O' and W.is_main = 'O'

      where N.mb_leave_date = ''
      order by N.mb_datetime desc;


    `;

    /*
    
      SELECT
      
        DATE_FORMAT(N.mb_datetime , '%Y-%m-%d %H:%i:%S') as mb_datetime,
        N.mb_email,
        M.mb_name, 
        M.mb_id,
        W.address as real_address,
        W.email as real_email,
        W.idx as wallet_idx,
        W.user_idx,
        if(W.address is null, 'Y', 'N') as not_match_user,
        if(W.address is null, '미 매칭 사용자', '매칭 사용자') as not_match_user_text        

      from g5_member as N inner join g5_member_kyc as K ON N.mb_no = K.mb_user_key and K.approval_yn = 'Y' left outer join tbl_pth_wallet_info as W ON BINARY(N.mb_email) = BINARY(W.email) and W.active = 'O' left outer join g5_member as M ON W.user_idx = M.mb_no 

      order by N.mb_datetime desc;
    */

    /*

      SELECT
      
        DATE_FORMAT(N.reg_date , '%Y-%m-%d %H:%i:%S') as mb_datetime,
        N.mb_email,
        N.mb_invite_code,
        N.mb_invite_code as invite_code,
        N.wallet_address,
        M.mb_name, 
        M.mb_id,
        W.address as real_address,
        W.email as real_email,
        W.idx as wallet_idx,
        W.user_idx,
        if(W.address is null, 'Y', 'N') as not_match_user,
        if(W.address is null, '미 매칭 사용자', '매칭 사용자') as not_match_user_text        

      from g5_node_member as N left outer join tbl_pth_wallet_info as W ON BINARY(N.mb_email) = BINARY(W.email) and W.active = 'O' left outer join g5_member as M ON W.user_idx = M.mb_no 

      order by N.reg_date desc;
    */

    const [rows_node_member, fields_node_member] = await connection.execute(sql_node_member);

    console.log(rows_node_member.length);

    const response = NextResponse.json({ 
        
        result: 'success',
        result_data : rows,
        result_node_member_data : rows_node_member

      });

      connection.release(); // 연결 반환
    
      return response;
    
  
  }catch(error){

    console.log(error);

  }

}