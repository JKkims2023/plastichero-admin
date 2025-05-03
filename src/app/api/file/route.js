import { NextResponse } from 'next/server';
import { getSignedFileUrl, getFileUrlFromKey } from '../../lib/s3Config';
import { s3Client } from '../../lib/s3Config';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

export async function GET(request) {
    try {
        // URL에서 파일 키 추출
        const url = new URL(request.url);
        const fileKey = url.searchParams.get('key');
        const direct = url.searchParams.get('direct') === 'true';
        const inline = url.searchParams.get('inline') === 'true';
        
        console.log('파일 URL 요청:', fileKey, 'inline:', inline);
        
        if (!fileKey) {
            console.error('파일 키가 제공되지 않음');
            return NextResponse.json({
                success: false,
                message: '파일 키가 제공되지 않았습니다.'
            }, { status: 400 });
        }
        
        // 파일 키가 이미 전체 URL인 경우, 키 부분만 추출
        let processedKey = fileKey;
        if (fileKey.startsWith('http')) {
            console.log('URL에서 키 추출 시도:', fileKey);
            try {
                const parsedUrl = new URL(fileKey);
                const path = parsedUrl.pathname;
                // S3 URL에서 버킷 이름 이후의 경로만 추출
                const match = path.match(/\/([^\/]+)\/(.+)/);
                if (match && match[2]) {
                    processedKey = match[2];
                    console.log('추출된 키:', processedKey);
                }
            } catch (e) {
                console.error('URL 파싱 오류:', e);
            }
        }
        
        // 파일 확장자 추출
        const fileExt = processedKey.split('.').pop()?.toLowerCase();
        console.log('파일 확장자:', fileExt);
        
        // PDF 파일 직접 스트리밍 (GetObject 사용)
        if (fileExt === 'pdf' || inline) {
            try {
                console.log('S3에서 PDF 파일 직접 가져오기:', processedKey);
                
                // S3에서 객체 가져오기
                const command = new GetObjectCommand({
                    Bucket: 'plastichero-assets',
                    Key: processedKey,
                });
                
                const s3Response = await s3Client.send(command);
                
                // S3 응답에서 스트림 가져오기
                const stream = s3Response.Body;
                
                if (!stream) {
                    throw new Error('S3에서 파일 데이터를 가져올 수 없습니다.');
                }
                
                // 파일 이름 추출
                const fileName = processedKey.split('/').pop() || 'document.pdf';
                
                // ReadableStream으로 변환
                let bytes;
                if (stream instanceof Readable) {
                    // Node.js Readable 스트림인 경우
                    bytes = await new Promise((resolve, reject) => {
                        const chunks = [];
                        stream.on('data', chunk => chunks.push(chunk));
                        stream.on('end', () => resolve(Buffer.concat(chunks)));
                        stream.on('error', reject);
                    });
                } else if (stream instanceof Uint8Array) {
                    // 이미 Uint8Array인 경우
                    bytes = stream;
                } else {
                    console.log('스트림 타입:', typeof stream);
                    // 알 수 없는 타입의 경우 문자열로 변환 시도
                    bytes = await stream.transformToByteArray();
                }
                
                // 적절한 헤더와 함께 파일 반환
                return new NextResponse(bytes, {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': `inline; filename="${encodeURIComponent(fileName)}"`,
                        'Cache-Control': 'public, max-age=86400',
                    },
                });
            } catch (error) {
                console.error('PDF 직접 스트리밍 오류:', error);
                // 오류 시 원래 방식으로 폴백
                console.log('서명된 URL로 대체 시도');
            }
        }
        
        // direct 모드일 경우 리다이렉트로 처리 (서명되지 않은 URL로)
        if (direct) {
            const directUrl = getFileUrlFromKey(processedKey);
            console.log('직접 접근 URL로 리다이렉트:', directUrl);
            return NextResponse.redirect(directUrl);
        }
        
        // S3에서 서명된 URL 가져오기
        console.log('서명된 URL 요청 중, 키:', processedKey);
        const result = await getSignedFileUrl(processedKey);
        
        if (!result.success) {
            console.error('파일 URL 생성 실패:', result.error);
            return NextResponse.json({
                success: false,
                message: '파일 URL 생성 중 오류가 발생했습니다.',
                error: result.error
            }, { status: 500 });
        }
        
        console.log('서명된 URL 생성 성공:', result.url.substring(0, 100) + '...');
        
        // 파일 유형에 따른 헤더 설정
        const headers = {
            'Cache-Control': 'public, max-age=3600', // 1시간 캐싱
            'Vary': 'Accept'
        };
        
        // PDF 파일인 경우 추가 헤더 설정
        if (fileExt === 'pdf') {
            headers['Content-Type'] = 'application/pdf';
            
            // PDF 파일명 추출 시도
            const fileName = processedKey.split('/').pop() || 'document.pdf';
            headers['Content-Disposition'] = `inline; filename="${encodeURIComponent(fileName)}"`;
        }
        
        // URL로 리다이렉트 (JSON 응답 대신)
        console.log('최종 리다이렉트 URL:', result.url.substring(0, 100) + '...');
        return NextResponse.redirect(result.url, { headers });
        
    } catch (error) {
        console.error('파일 요청 중 오류 발생:', error);
        return NextResponse.json({
            success: false,
            message: '파일 요청 중 오류가 발생했습니다.',
            error: error.message
        }, { status: 500 });
    }
} 