// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import { getConnection } from '../../../../lib/db';


export async function POST(request) {

  try{

    const { notice_no, } = await request.json();

    const connection = await getConnection();

    const sql = `
    
        SELECT 
        
        comment_no, 
        notice_no, 
        mb_no, 
        comment, 
        approval_yn,
        if(approval_yn = 'Y', '승인', '미승인') as approval_yn_text,
        reg_date, 
        delete_flag
        FROM g5_notice_comment

      WHERE notice_no = ${notice_no} and delete_flag = 'N'

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