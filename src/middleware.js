// src/middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import sessionStore from './app/store/sessionStore';


const JWT_SECRET = 'plastichero!*1'; // 실제 환경에서는 안전하게 관리해야 합니다.

// 인증이 필요 없는 경로 목록
const publicPaths = ['/page/login', '/api/login', '/api/logout'];

export async function middleware(request) {

  console.log('middleware inside');
  console.log('middleware inside pathname');


  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;


  // 1. publicPaths에 해당하는 경로는 인증 검사 없이 통과
  if (publicPaths.includes(pathname)) {

    console.log('jk free pass');

    return NextResponse.next();
  }

  console.log('middleware check before2');

  console.log('token', token);

  // 2. 토큰이 없으면 로그인 페이지로 리다이렉트
  if (!token) {

    console.log('jk empty');

    return NextResponse.redirect(new URL('/page/login', request.url));
  }

  // 3. 토큰 검증
  try {
//    jwt.verify(token, JWT_SECRET);

    console.log('jk verify before');

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

    const sessionResult = await sessionStore(payload.username);

    console.log('sessionResult : ' + sessionResult);

    console.log(sessionResult);


    if (sessionResult.result == 'success') {

      console.log('jk verifiy after');

      return NextResponse.next();
      
    } else {

      console.error('JWT verification failed:', sessionResult.message);
      return NextResponse.redirect(new URL('/page/login', request.url));
    
    }


  } catch (error) {
    
    console.error('JWT verification failed:', error);
    return NextResponse.redirect(new URL('/page/login', request.url));
  
  }
}

// 미들웨어를 적용할 경로 설정
export const config = {
  matcher: [
    '/', // 모든 경로에 미들웨어 적용 (public 파일 제외)
  ],
};