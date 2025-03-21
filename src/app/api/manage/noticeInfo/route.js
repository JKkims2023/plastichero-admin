// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import { getConnection } from '../../../lib/db';


export async function POST(request) {

  try{

    const { filterInfo, fromDate, toDate } = await request.json();

    const connection = await getConnection();

    const sql = `
    
      SELECT 
                
          notice_no, 
          notice_title, 
          notice_desctription, 
          comment_flag,
          notice_picture, 
          notice_picture2, 
          notice_picture3, 
          notice_picture4, 
          notice_picture5,
          notice_movie, 
          notice_html, 
          notice_type, 
          DATE_FORMAT(reg_date, '%Y-%m-%d %H:%i:%s') as reg_date, 
          delete_flag

      FROM g5_notice 

      WHERE delete_flag = 'N'

      order by reg_date desc

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