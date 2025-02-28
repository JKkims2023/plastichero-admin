// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import { getConnection } from '../../lib/db';
import useAuthStore from '../../store/authStore';

import { jwtVerify } from 'jose';

const JWT_SECRET = 'plastichero!*1'; // 실제 환경에서는 안전하게 관리해야 합니다.


export async function POST(request) {

  try{

   // const login = useAuthStore((state) => state.login);

    const connection = await getConnection();

    const token = request.cookies.get('token')?.value;
    const pathname = request.nextUrl.pathname;


    console.log('session jk  check before');

    console.log('token', token);

    // 2. 토큰이 없으면 로그인 페이지로 리다이렉트
    if (!token) {

      console.log('session check jk empty');

      return NextResponse.json({ message: 'session check fail.' }, { status: 401 });

    }

    // 토큰이 'Bearer ' 접두사를 포함하고 있는지 확인하고 제거
    const actualToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
      
    // secret key 생성 방식 변경
    const secret = new Uint8Array(JWT_SECRET.length);

    for (let i = 0; i < JWT_SECRET.length; i++) {
      
      secret[i] = JWT_SECRET.charCodeAt(i);
    
    }

    // JWT 검증
    const { payload } = await jwtVerify(actualToken, secret);

    console.log('Decoded payload:', payload);


    const sql = `
    
      SELECT * FROM tbl_system_user_main 
      
      where user_id = '${payload.username}' 

      and delete_flag = 'N';

    `;

    const [rows, fields] = await connection.execute(sql);


    if(rows.length == 0){

      connection.release();

      return NextResponse.json({ message: '로그인 아이디를 확인 바랍니다.' }, { status: 401 });

    }

    if (rows[0].user_id == payload.username) {
            
          const response = NextResponse.json({ 
              
            message: 'success',
            user_id : payload.username,
            user_name :  rows[0].user_name,
            user_type : rows[0].user_type,
            menu_auth : rows[0].menu_auth,

          });

            connection.release(); // 연결 반환
          
            return response;
          
    } else {
      
        connection.release(); // 연결 반환
        return NextResponse.json({ message: '로그인 정보를 다시 확인 하시기 바랍니다.' }, { status: 401 });

    }
  
  }catch(error){

    console.log(error);
    return NextResponse.json({ message: error.message }, { status: 401 });
  }

}