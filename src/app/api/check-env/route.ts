import { NextResponse } from 'next/server';

export async function GET() {
  // AWS 환경 변수 확인
  const envVars = {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ? 'FOUND (hidden for security)' : 'NOT FOUND',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ? 'FOUND (hidden for security)' : 'NOT FOUND',
    bucketName: process.env.S3_BUCKET_NAME,
    nodeEnv: process.env.NODE_ENV
  };
  
  return NextResponse.json({ 
    message: '환경 변수 상태', 
    environment: process.env.NODE_ENV,
    variables: envVars 
  });
} 