// src/middleware.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { jwtVerify } from 'jose';
import { TextEncoder, TextDecoder } from 'util'; // util 모듈에서 가져오기


const JWT_SECRET = 'plastichero!*1'; // 실제 환경에서는 안전하게 관리해야 합니다.

// 인증이 필요 없는 경로 목록
const publicPaths = ['/login', '/api/login', '/api/logout'];


export async function middleware(request) {

  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;

  console.log('jk');

  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;

  console.log(request);

  // 1. publicPaths에 해당하는 경로는 인증 검사 없이 통과
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // 2. 토큰이 없으면 로그인 페이지로 리다이렉트
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. 토큰 검증
  try {
//    jwt.verify(token, JWT_SECRET);

    // JWT 검증
    await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));

    return NextResponse.next();

  } catch (error) {
    
    console.error('JWT verification failed:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  
  }
}

// 미들웨어를 적용할 경로 설정
export const config = {
  matcher: [
    '/', // 모든 경로에 미들웨어 적용 (public 파일 제외)
  ],
};