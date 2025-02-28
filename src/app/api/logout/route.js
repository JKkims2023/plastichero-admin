// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { SignJWT, jwtVerify } from 'jose';
import { TextEncoder, TextDecoder } from 'util'; // util 모듈에서 가져오기
import { Buffer } from 'buffer'; // buffer 모듈 import
import { getConnection } from '../../lib/db';

export async function POST(request) {

  try{

    const {username} = await request.json();

    const serializedCookie = serialize('token', '', {
    
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: -1, // 쿠키 만료 설정
    
    });

    const response = NextResponse.json({
    
      message: 'success',
    
    });

    // Set-Cookie 헤더 설정
    response.headers.set('Set-Cookie', serializedCookie);

    return response;

  
  }catch(error){

    const response = NextResponse.json({
    
      message: 'fail',
    
    });

    console.log(error);

  }

}