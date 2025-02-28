// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import { getConnection } from '../../../lib/db';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';

export async function POST(request) {

  const connection = await getConnection();

  try{


    const { user_id, user_pw, user_type, user_name, manage_type, user_key, menu_auth} = await request.json();


    let user_keyInfo = '';
    
    if(user_key == ''){
      
      user_keyInfo = crypto.randomBytes(16).toString('hex');
    
    }else{
      
      user_keyInfo = user_key;
    
    }

    let crypto_pw = '';

    if(manage_type == 'add'){

      if(user_pw != ''){

        crypto_pw = await bcryptjs.hash(user_pw, 10);
      
      }else{
  
        crypto_pw = await bcryptjs.hash('plastichero1!', 10);
  
      }

      const selectedMenuAuth = JSON.stringify(menu_auth);
  
      const sql = `
      
        INSERT INTO tbl_system_user_main(
        user_key,
        user_id, 
        user_pw, 
        user_type, 
        user_name,
        menu_auth,
        delete_flag, 
        create_date)
        VALUES('${user_keyInfo}', '${user_id}', '${crypto_pw}', '${user_type}', '${user_name}', '${selectedMenuAuth}', 'N', CURRENT_TIMESTAMP);
  
      `;

      const [rows, fields] = await connection.execute(sql);

      /*
      for(let i = 0; i < selectedMenuAuth.length; i++){

        const menu_auth = selectedMenuAuth[i];

        console.log(menu_auth);

        if(menu_auth.checked){

          const menu_auth_row = menu_auth.children;

          for(let j = 0; j < menu_auth_row.length; j++){

            const menu_auth_row_item = menu_auth_row[j];

            const sql = `
            
                INSERT INTO tbl_system_user_menu_auth(
                user_key,
                menu_auth)
                VALUES('${user_keyInfo}', '${menu_auth_row_item.id}');

            `;

            const [rows, fields] = await connection.execute(sql);

          }

        }else{

          const menu_auth_row = menu_auth.children;

          for(let j = 0; j < menu_auth_row.length; j++){

            const menu_auth_row_item = menu_auth_row[j];

            const sql = `
            
                INSERT INTO tbl_system_user_menu_auth(
                user_key,
                menu_auth)
                VALUES('${user_keyInfo}', '${menu_auth_row_item.id}');

            `;

            const [rows, fields] = await connection.execute(sql);

          }

        }

      }
      */

      const response = NextResponse.json({ 
          
          result: 'success',
          result_data : rows,
  
        
        });

        connection.release(); // 연결 반환
      
        return response;

    }else if(manage_type == 'update'){

  
      const selectedMenuAuth = JSON.stringify(menu_auth);

      const sql = `
 
        UPDATE tbl_system_user_main
        
        SET

          user_name = '${user_name}',
          user_type = '${user_type}',
          menu_auth = '${selectedMenuAuth}'

        WHERE user_key = '${user_key}';
    
  
      `;

      const [rows, fields] = await connection.execute(sql);

      const response = NextResponse.json({ 
          
          result: 'success',
          result_data : rows,
  
        
        });

        connection.release(); // 연결 반환
      
        return response;

    }else if(manage_type == 'delete'){

    }else if(manage_type == 'password'){

    }else if(manage_type == 'duplicate'){
  
      const sql = `
      
        SELECT * FROM tbl_system_user_main

        where user_id = '${user_id}'

        and delete_flag = 'N';

      `;

      const [rows, fields] = await connection.execute(sql);

      if(rows.length > 0){
     
          const response = NextResponse.json({ 
            
            result: 'fail',
            result_data : '이미 존재하는 사용자 아이디입니다.',
    
          
          });

          connection.release(); // 연결 반환
        
          return response;

        }else{

          const response = NextResponse.json({ 
            
            result: 'success',
            result_data : '사용 가능한 사용자 아이디입니다.',
          });

          connection.release(); // 연결 반환
        
          return response;
        }

      }

  }catch(error){

    connection.release(); // 연결 반환
    console.log(error);

    return NextResponse.json({ message: '사용자 등록 처리 중 오류가 발생했습니다.' }, { status: 500 });

  }

}