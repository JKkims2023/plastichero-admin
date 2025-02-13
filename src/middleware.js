// src/middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { TextEncoder, TextDecoder } from 'util'; // util 모듈에서 가져오기
import { Buffer } from 'buffer'; // buffer 모듈 import

const JWT_SECRET = 'plastichero!*1'; // 실제 환경에서는 안전하게 관리해야 합니다.

// 인증이 필요 없는 경로 목록
const publicPaths = ['/page/login', '/api/login', '/api/logout'];

export async function middleware(request) {

  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;

  console.log('middleware inside');
  console.log('middleware inside pathname');

  console.log(request.nextUrl.pathname);


  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;


  // 1. publicPaths에 해당하는 경로는 인증 검사 없이 통과
  if (publicPaths.includes(pathname)) {

    console.log('jk free pass');

    return NextResponse.next();
  }

  // 2. 토큰이 없으면 로그인 페이지로 리다이렉트
  if (!token) {

    console.log('jk empty');

    return NextResponse.redirect(new URL('/page/login', request.url));
  }

  // 3. 토큰 검증
  try {
//    jwt.verify(token, JWT_SECRET);

    console.log('jk verify before');

    // JWT 검증
    await jwtVerify(token, Buffer.from(JWT_SECRET));

    console.log('jk verifiy after');

    return NextResponse.next();

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