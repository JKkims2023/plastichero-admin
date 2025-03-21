import { NextConfig } from 'next';


// process.on('exit')를 사용하여 서버 종료 시 Cron 작업을 정리할 수 있습니다.

const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '50mb'
        }
    },
    images: {
        domains: ['localhost'], // 개발 환경
        // 이미지 최적화 설정 추가
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
    // 정적 파일 제공 설정
    async rewrites() {
        return [
            {
                source: '/uploads/:path*',
                destination: '/api/uploads/:path*',
            },
        ];
    },
} as NextConfig;

export default nextConfig;
