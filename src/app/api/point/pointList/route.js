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

    const { pagingIdx, filterInfo, fromDate, toDate } = await request.json();

    const connection = await getConnection();

    let sql_filter = 'and  point_type in(3,4) ';

    const sql_datetime = `and po_datetime > '${fromDate.substring(0,10)}' and po_datetime < '${toDate.substring(0,10)}' `;

    if(filterInfo != '-1'){

      sql_filter = `and point_type = ${filterInfo} `;

    }

    const sql = `
    
      SELECT 

        po_id, 
        mb_id,
        DATE_FORMAT(po_datetime , '%Y-%m-%d %H:%i:%S') as po_datetime, 
        po_content, 
        po_point, 
        po_use_point, 
        po_expired, 
        po_expire_date, 
        po_mb_point, 
        po_rel_table, 
        po_rel_id, 
        po_rel_action, 
        po_reward_type, 
        po_pth, 
        po_mb_pth, 
        po_txid,
        point_type, 
        if(point_type = 3, '기프티콘 구매', '기프티콘 구매취소') as point_type_text,
        swap_pth

        FROM g5_point
        
        where 1=1 ${sql_filter} ${sql_datetime}

        order by po_datetime desc
        
      
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