// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { SignJWT, jwtVerify } from 'jose';
import { TextEncoder, TextDecoder } from 'util'; // util 모듈에서 가져오기
import { Buffer } from 'buffer'; // buffer 모듈 import
import { getConnection } from '../../../../lib/db';


export async function POST(request) {

  try{

    const { filterInfo, keyword } = await request.json();

    const connection = await getConnection();


    let sql = '';

    switch(filterInfo){

      case 'address':
        
        sql = `
        
        SELECT 

          W.user_idx,
          W.email,
          W.new_address as address,
          M.mb_id,
          M.mb_name

        FROM tbl_pth_wallet_info as W left outer join g5_member as M ON W.user_idx = M.mb_no

        where W.address like '%${keyword}%' and W.active = 'O'
        
        order by M.mb_open_date desc;`;

      break;

      case 'ownerName':
        
        sql = `
          
        SELECT 

          M.mb_id,
          M.mb_name,
          W.user_idx,
          W.new_address,
          W.email


        FROM g5_member as M left outer join tbl_pth_wallet_info as W ON M.mb_no = W.user_idx 

        where M.mb_name like '%${keyword}%' and W.active = 'O'
        
        order by M.mb_open_date desc;

      `;
        break;  

      case 'userId':
        
        sql = `
              
          SELECT 

            M.mb_id,
            M.mb_name,
            W.user_idx,
            W.new_address as address,
            W.email


          FROM g5_member as M left outer join tbl_pth_wallet_info as W ON M.mb_no = W.user_idx 

          where M.mb_id like '%${keyword}%' and W.active = 'O'
          
          order by M.mb_open_date desc;`

        break;

      case 'email':


        sql = `
        
        SELECT 

          W.user_idx,
          W.email,
          W.new_address as address,
          M.mb_id,
          M.mb_name

        FROM tbl_pth_wallet_info as W left outer join g5_member as M ON W.user_idx = M.mb_no

        where W.email like '%${keyword}%' and W.active = 'O'
        
        order by M.mb_open_date desc;`;
        

        break;

    } 


    console.log('sql : ', sql);

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