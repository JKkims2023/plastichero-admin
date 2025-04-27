import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { readFile, stat } from 'fs/promises';
import chalk from 'chalk';

export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {

    console.log('GET');
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
        console.log(chalk.blue('📁 [Public API] Attempting to access file:'), chalk.cyan(filePath));

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

        console.log(chalk.green('📤 [Public API] Serving file:'), {
            type: contentType,
            size: `${(fileBuffer.length / 1024).toFixed(2)}KB`
        });

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000',
                'Content-Length': fileBuffer.length.toString(),
                'Access-Control-Allow-Origin': '*', // CORS 허용 설정
            }
        });

    } catch (error) {
        // 상세한 에러 로깅
        console.error(chalk.red('💥 [Public API] Server Error:'));
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