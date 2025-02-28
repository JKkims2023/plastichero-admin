import type { NextConfig } from "next";
import { startCronJob } from "./src/app/cron";

let isCronJobStarted = false; // Cron 작업 시작 여부를 추적하는 변수

if (typeof window === "undefined") {
  // 서버가 시작될 때 한 번만 호출
  if (!isCronJobStarted) {
    startCronJob(); // 서버 시작 시 Cron 작업 시작
    isCronJobStarted = true; // Cron 작업이 시작되었음을 표시
  }
}

// process.on('exit')를 사용하여 서버 종료 시 Cron 작업을 정리할 수 있습니다.

const nextConfig: NextConfig = {
  /* config options here */
  
  // webpack 설정 제거
};

export default nextConfig;
