import { NextConfig } from 'next';


// process.on('exit')를 사용하여 서버 종료 시 Cron 작업을 정리할 수 있습니다.

const nextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '50mb'
        }
    },
    eslint: {
        ignoreDuringBuilds: true, // 빌드 중 ESLint 무시
      },
    typescript: {
        ignoreBuildErrors: true, // 타입스크립트 오류 무시
    },
    images: {
        domains: [
            'localhost', // 개발 환경
            'plastichero-assets.s3.ap-northeast-2.amazonaws.com', // AWS S3 버킷
            's3.ap-northeast-2.amazonaws.com' // S3 리전
        ],
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
            // 공개 API용 경로 추가
            {
                source: '/public/media/:path*',
                destination: '/api/public/media/:path*',
            },
            // S3 파일 API 경로 추가
            {
                source: '/s3-file/:path*',
                destination: '/api/file?key=:path*',
            },
        ];
    },
} as NextConfig;

export default nextConfig;
