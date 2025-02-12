// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { SignJWT, jwtVerify } from 'jose';
import { TextEncoder, TextDecoder } from 'util'; // util 모듈에서 가져오기
import { Buffer } from 'buffer'; // buffer 모듈 import


const JWT_SECRET = 'plastichero!*1'; // 실제 환경에서는 안전하게 관리해야 합니다.


export async function POST(request) {

  const { username, password } = await request.json();

  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
  

  // 간단한 사용자 인증 (실제로는 데이터베이스에서 확인해야 합니다)
  if (username === 'user' && password === 'password') {
    // JWT 생성
  //  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '12h' }); // 만료 시간 설정

  const token = await new SignJWT({ username })
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuedAt()
  .setExpirationTime('12h')
  .sign(Buffer.from(JWT_SECRET));

    // 쿠키 설정
    /*
    const serializedCookie = serialize('token', token, {
      httpOnly: true, // JavaScript에서 접근 불가능
      secure: process.env.NODE_ENV === 'production', // HTTPS 환경에서만 전송
      sameSite: 'strict', // CSRF 공격 방지
      path: '/',
      maxAge: 60 * 60 * 12, // 1시간 (초 단위)
    });
    */
    const serializedCookie = serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60,
    });

    const response = NextResponse.json({ message: 'Login successful' });

    // Set-Cookie 헤더 설정
    response.headers.set('Set-Cookie', serializedCookie);

    return response;
  } else {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }
}