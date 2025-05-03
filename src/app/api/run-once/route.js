import { NextResponse } from 'next/server';
import { makeMediaFoldersPublic } from '../../lib/makeBucketPublic';

// 서버 시작 시 한 번만 실행되는 초기화 코드
let initialized = false;

/**
 * 서버 초기화 함수
 * S3 버킷 정책 설정 등의 초기화 작업 수행
 */
async function initializeServer() {
  if (initialized) return;
  
  try {
    // S3 버킷의 이미지, 비디오 폴더에 대한 공개 액세스 정책 설정
    await makeMediaFoldersPublic();
    console.log('서버 초기화 완료: S3 버킷 정책 설정됨');
    initialized = true;
  } catch (error) {
    console.error('서버 초기화 중 오류 발생:', error);
  }
}

// 서버 시작 시 초기화 실행
initializeServer().catch(console.error);

export async function GET() {
  try {
    // 이미 초기화되었으면 바로 결과 반환
    if (initialized) {
      return NextResponse.json({
        success: true,
        message: '서버가 이미 초기화되었습니다.'
      });
    }
    
    // 아직 초기화되지 않았으면 초기화 실행
    await initializeServer();
    
    return NextResponse.json({
      success: true,
      message: '서버 초기화가 완료되었습니다.'
    });
  } catch (error) {
    console.error('초기화 API 오류:', error);
    return NextResponse.json({
      success: false,
      message: '서버 초기화 중 오류가 발생했습니다.',
      error: error.message
    }, { status: 500 });
  }
} 