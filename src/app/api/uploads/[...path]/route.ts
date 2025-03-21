import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { readFile, stat } from 'fs/promises';
import { getConnection } from '../../../lib/db';
import chalk from 'chalk';

export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    try {
        // params 유효성 검사
        if (!params?.path) {
            console.error(chalk.red('🚫 Error: Invalid path parameters'));
            console.error(chalk.yellow('Request URL:'), request.url);
            return NextResponse.json(
                { error: 'Invalid path parameters' },
                { status: 400 }
            );
        }

        const filePath = join(process.cwd(), 'public', 'uploads', ...(await Promise.resolve(params.path)));

        // 파일 경로 로깅
        console.log(chalk.blue('📁 Attempting to access file:'), chalk.cyan(filePath));

        // 파일 존재 여부 확인
        try {
            const stats = await stat(filePath);
            console.log(chalk.green('✅ File found:'), {
                size: `${(stats.size / 1024).toFixed(2)}KB`,
                created: stats.birthtime,
                modified: stats.mtime
            });
        } catch (error) {
            console.error(chalk.red('❌ File not found:'), chalk.yellow(filePath));
            console.error(chalk.gray('Stack trace:'), error);
            return NextResponse.json(
                { 
                    error: 'File not found',
                    path: filePath.replace(process.cwd(), ''),
                    message: 'The requested file does not exist'
                },
                { status: 404 }
            );
        }

        // 파일 읽기
        const fileBuffer = await readFile(filePath);

        // Content-Type 설정
        const contentTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.mp4': 'video/mp4',
            '.webm': 'video/webm',
            '.mov': 'video/quicktime'
        };

        const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
        const contentType = contentTypes[ext] || 'application/octet-stream';

        console.log(chalk.green('📤 Serving file:'), {
            type: contentType,
            size: `${(fileBuffer.length / 1024).toFixed(2)}KB`
        });

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000',
                'Content-Length': fileBuffer.length.toString()
            }
        });

    } catch (error) {
        // 상세한 에러 로깅
        console.error(chalk.red('💥 Server Error:'));
        console.error(chalk.red('URL:'), request.url);
        console.error(chalk.red('Path params:'), params);
        console.error(chalk.red('Error details:'), {
            name: error.name,
            message: error.message,
            stack: error.stack
        });

        return NextResponse.json(
            { 
                error: 'Internal server error',
                message: error.message,
                path: request.url
            },
            { status: 500 }
        );
    }
}

export async function getNoticeFiles(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const noticeNo = searchParams.get('noticeNo');

        const connection = await getConnection();

        const [rows] = await connection.execute(
            `SELECT 
                notice_picture, 
                notice_picture2, 
                notice_picture3, 
                notice_picture4, 
                notice_picture5, 
                notice_movie 
            FROM g5_notice 
            WHERE notice_no = ?`,
            [noticeNo]
        );

        connection.release();

        // 파일 URL 구성
        const files = rows[0];
        const fileUrls = {
            images: [],
            video: null
        };

        // 이미지 URL 구성
        ['notice_picture', 'notice_picture2', 'notice_picture3', 'notice_picture4', 'notice_picture5'].forEach(key => {
            if (files[key]) {
                fileUrls.images.push(`/uploads/images/${files[key]}`);
            }
        });

        // 비디오 URL 구성
        if (files.notice_movie) {
            fileUrls.video = `/uploads/videos/${files.notice_movie}`;
        }

        return NextResponse.json({
            success: true,
            files: fileUrls
        });

    } catch (error) {
        console.error('파일 정보 조회 중 오류:', error);
        return NextResponse.json({
            success: false,
            message: '파일 정보 조회 중 오류가 발생했습니다.'
        }, { status: 500 });
    }
} 