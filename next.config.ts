import type { NextConfig } from "next";


// process.on('exit')를 사용하여 서버 종료 시 Cron 작업을 정리할 수 있습니다.

const nextConfig: NextConfig = {
  /* config options here */
  
  // webpack 설정 제거
};

export default nextConfig;
