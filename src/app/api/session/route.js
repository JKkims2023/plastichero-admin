// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import { serialize } from 'cookie';
import { SignJWT, jwtVerify } from 'jose';
import { Buffer } from 'buffer'; // buffer 모듈 import
import { getConnection } from '../../lib/db';


const JWT_SECRET = 'plastichero!*1'; // 실제 환경에서는 안전하게 관리해야 합니다.


export async function POST(request) {

  try{

    console.log('jk session');

    const { user_id } = await request.json();  
    
    const connection = await getConnection();

    console.log('jk session user_id : ' + user_id);

    const sql = `
    
      SELECT * FROM tbl_system_user_main 
      
      where user_id = '${user_id}' 

      and delete_flag = 'N';

    `;

    const [rows, fields] = await connection.execute(sql);


    if(rows.length == 0){

      connection.release();

      return NextResponse.json({ message: '로그인 아이디를 확인 바랍니다.' }, { status: 401 });

    }

    if (rows[0].user_id == user_id) {


          
          const sql_menu_auth = `
        
            SELECT * FROM tbl_system_menu_auth 
            
            where user_key = '${rows[0].user_key}' 
      
            and delete_flag = 'N';
      
          `;
    
          const [rows_menu, fields_menu] = await connection.execute(sql_menu_auth);
        
          const data = { 
              
              message: 'Login successful',
              user_id : user_id,
              user_name :  rows[0].user_name,
              user_type : rows[0].user_type,
              menu_auth : rows_menu,

            };

            login( data ); // 로그인 성공

            connection.release(); // 연결 반환
          
            return response;
          
    } else {
      
        connection.release(); // 연결 반환
        return NextResponse.json({ message: '로그인 정보를 다시 확인 하시기 바랍니다.' }, { status: 401 });

    }
  
  }catch(error){

    console.log(error);

  }

}