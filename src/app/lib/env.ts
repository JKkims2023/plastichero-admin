// Next.js에서 환경 변수가 로드되지 않을 경우를 대비한 백업 로더
import * as dotenv from 'dotenv';

// 환경 변수 로드 시도
dotenv.config({ path: '.env.local' });

// 환경 변수 객체
export const ENV = {
  AWS_REGION: process.env.AWS_REGION || 'ap-northeast-2',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || 'plastichero-assets',
};

// 환경 변수가 로드되었는지 확인
export function checkEnvVars() {
  const missingVars = [];
  
  if (!ENV.AWS_ACCESS_KEY_ID) missingVars.push('AWS_ACCESS_KEY_ID');
  if (!ENV.AWS_SECRET_ACCESS_KEY) missingVars.push('AWS_SECRET_ACCESS_KEY');
  
  if (missingVars.length > 0) {
    console.warn(`경고: 다음 환경 변수가 설정되지 않았습니다: ${missingVars.join(', ')}`);
    return false;
  }
  
  return true;
}

// 환경 로그(개발 환경에서만)
if (process.env.NODE_ENV !== 'production') {
  console.log('환경 설정 상태:');
  console.log('- AWS 리전:', ENV.AWS_REGION);
  console.log('- S3 버킷:', ENV.S3_BUCKET_NAME);
  console.log('- AWS 키 설정:', ENV.AWS_ACCESS_KEY_ID ? '있음' : '없음');
} 