import { NextResponse } from 'next/server';
import { getSignedFileUrl, getFileUrlFromKey } from '../../lib/s3Config';

export async function GET(request) {
    try {
        // URL에서 파일 키 추출
        const url = new URL(request.url);
        const fileKey = url.searchParams.get('key');
        const direct = url.searchParams.get('direct') === 'true';
        
        console.log('파일 URL 요청:', fileKey);
        
        if (!fileKey) {
            console.error('파일 키가 제공되지 않음');
            return NextResponse.json({
                success: false,
                message: '파일 키가 제공되지 않았습니다.'
            }, { status: 400 });
        }
        
        // 파일 키가 이미 전체 URL인 경우 처리
        if (fileKey.startsWith('http')) {
            console.log('이미 전체 URL인 파일 키를 리다이렉트:', fileKey);
            return NextResponse.redirect(fileKey);
        }
        
        // 파일 확장자 추출
        const fileExt = fileKey.split('.').pop()?.toLowerCase();
        console.log('파일 확장자:', fileExt);
        
        // direct 모드일 경우 리다이렉트로 처리 (서명되지 않은 URL로)
        // 공개적으로 접근 가능한 이미지/비디오인 경우 사용
        if (direct) {
            const directUrl = getFileUrlFromKey(fileKey);
            console.log('직접 접근 URL로 리다이렉트:', directUrl);
            return NextResponse.redirect(directUrl);
        }
        
        // S3에서 서명된 URL 가져오기
        console.log('서명된 URL 요청 중, 키:', fileKey);
        const result = await getSignedFileUrl(fileKey);
        
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
            const fileName = fileKey.split('/').pop() || 'document.pdf';
            headers['Content-Disposition'] = `inline; filename="${encodeURIComponent(fileName)}"`;
        }
        
        // URL로 리다이렉트 (JSON 응답 대신)
        // 이렇게 하면 프론트엔드에서 추가 요청이 필요 없어짐
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