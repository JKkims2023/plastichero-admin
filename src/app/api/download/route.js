import { NextResponse } from 'next/server';
import { getSignedFileUrl } from '../../lib/s3Config';
import { s3Client } from '../../lib/s3Config';
import { GetObjectCommand } from '@aws-sdk/client-s3';

export async function GET(request) {
    try {
        // URL 파라미터에서 파일 URL 가져오기
        const url = new URL(request.url);
        const fileUrl = url.searchParams.get('url');
        
        console.log('파일 다운로드 요청:', fileUrl);
        
        if (!fileUrl) {
            return NextResponse.json({ 
                success: false, 
                message: '파일 URL이 제공되지 않았습니다' 
            }, { status: 400 });
        }
        
        // S3 키 추출
        let s3Key = '';
        
        if (fileUrl.includes('s3.') || fileUrl.includes('plastichero-assets')) {
            try {
                const parsedUrl = new URL(fileUrl);
                const path = parsedUrl.pathname;
                
                // S3 URL에서 버킷 이름 이후의 경로만 추출
                const match = path.match(/\/([^\/]+)\/(.+)/);
                if (match && match[2]) {
                    s3Key = match[2];
                } else {
                    // 경로에서 맨 앞의 슬래시(/) 제거
                    s3Key = path.startsWith('/') ? path.substring(1) : path;
                }
                
                console.log('추출된 S3 키:', s3Key);
            } catch (e) {
                console.error('URL 파싱 오류:', e);
                return NextResponse.json({ 
                    success: false, 
                    message: '유효하지 않은 URL 형식입니다' 
                }, { status: 400 });
            }
        } else {
            // 일반 URL인 경우 직접 파일 다운로드 시도
            try {
                console.log('외부 URL에서 파일 다운로드 시도:', fileUrl);
                const response = await fetch(fileUrl);
                
                if (!response.ok) {
                    throw new Error(`HTTP 오류: ${response.status}`);
                }
                
                const contentType = response.headers.get('content-type');
                const blob = await response.blob();
                const arrayBuffer = await blob.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                
                // 파일 이름 추출 시도
                let fileName = 'document.pdf';
                const contentDisposition = response.headers.get('content-disposition');
                if (contentDisposition) {
                    const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
                    if (matches && matches[1]) {
                        fileName = matches[1].replace(/['"]/g, '');
                    }
                } else {
                    // URL에서 파일 이름 추출 시도
                    const urlParts = fileUrl.split('/');
                    if (urlParts.length > 0) {
                        fileName = urlParts[urlParts.length - 1];
                    }
                }
                
                return new NextResponse(buffer, {
                    status: 200,
                    headers: {
                        'Content-Type': contentType || 'application/octet-stream',
                        'Content-Disposition': `inline; filename="${encodeURIComponent(fileName)}"`,
                        'Cache-Control': 'public, max-age=86400'
                    }
                });
            } catch (error) {
                console.error('외부 URL 다운로드 오류:', error);
                return NextResponse.json({ 
                    success: false, 
                    message: '파일 다운로드 실패', 
                    error: error.message 
                }, { status: 500 });
            }
        }
        
        // S3에서 파일 직접 다운로드
        try {
            console.log('S3에서 파일 다운로드 시도:', s3Key);
            
            // 파일 확장자 추출
            const fileExt = s3Key.split('.').pop()?.toLowerCase();
            const fileName = s3Key.split('/').pop() || 'document.pdf';
            
            // 콘텐츠 타입 설정
            let contentType = 'application/octet-stream';
            if (fileExt === 'pdf') {
                contentType = 'application/pdf';
            } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExt)) {
                contentType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;
            } else if (['mp4', 'webm', 'ogg'].includes(fileExt)) {
                contentType = `video/${fileExt}`;
            }
            
            // GetObject 커맨드로 파일 직접 가져오기
            const command = new GetObjectCommand({
                Bucket: 'plastichero-assets',
                Key: s3Key
            });
            
            try {
                // 먼저 직접 접근 시도
                const data = await s3Client.send(command);
                
                // 스트림에서 버퍼로 변환
                const chunks = [];
                for await (const chunk of data.Body) {
                    chunks.push(chunk);
                }
                const buffer = Buffer.concat(chunks);
                
                // 파일 제공
                return new NextResponse(buffer, {
                    status: 200,
                    headers: {
                        'Content-Type': contentType,
                        'Content-Disposition': `inline; filename="${encodeURIComponent(fileName)}"`,
                        'Cache-Control': 'public, max-age=86400'
                    }
                });
            } catch (s3Error) {
                console.error('S3 직접 접근 실패, 서명된 URL 시도:', s3Error);
                
                // 직접 접근 실패 시 서명된 URL 시도
                const { url, success, error } = await getSignedFileUrl(s3Key);
                
                if (!success) {
                    throw new Error(error || 'S3 서명된 URL 생성 실패');
                }
                
                // 서명된 URL로 파일 가져오기
                console.log('서명된 URL 사용하여 파일 가져오기');
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`HTTP 오류: ${response.status}`);
                }
                
                const blob = await response.blob();
                const arrayBuffer = await blob.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                
                // 파일 제공
                return new NextResponse(buffer, {
                    status: 200,
                    headers: {
                        'Content-Type': contentType,
                        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
                        'Cache-Control': 'public, max-age=86400'
                    }
                });
            }
        } catch (error) {
            console.error('S3 파일 다운로드 실패:', error);
            return NextResponse.json({ 
                success: false, 
                message: 'S3 파일 다운로드 실패', 
                error: error.message 
            }, { status: 500 });
        }
    } catch (error) {
        console.error('파일 다운로드 중 오류 발생:', error);
        return NextResponse.json({ 
            success: false, 
            message: '파일 다운로드 중 오류가 발생했습니다.', 
            error: error.message 
        }, { status: 500 });
    }
} 