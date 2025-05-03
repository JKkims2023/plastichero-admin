/**
 * S3 버킷의 이미지, 비디오 폴더에 대한 공개 액세스 정책을 설정하는 스크립트
 * 이 스크립트는 서버 시작 시 한 번만 실행하면 됩니다.
 */

import { S3Client, PutBucketPolicyCommand } from '@aws-sdk/client-s3';

// S3 설정 정보 하드코딩
const S3_CONFIG = {
  region: 'ap-northeast-2',
  credentials: {
    accessKeyId: 'AKIAR47724A577IOATXB',
    secretAccessKey: '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',
  },
  bucketName: 'plastichero-assets'
};

// S3 클라이언트 생성
const s3Client = new S3Client({
  region: S3_CONFIG.region,
  credentials: S3_CONFIG.credentials
});

/**
 * 이미지, 비디오 폴더에 대한 공개 액세스 정책을 설정하는 함수
 */
export async function makeMediaFoldersPublic() {
  // 버킷 이름
  const bucketName = S3_CONFIG.bucketName;
  
  // 공개 액세스 정책 생성
  const publicReadPolicy = {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'PublicReadForMediaFolders',
        Effect: 'Allow',
        Principal: '*',
        Action: ['s3:GetObject'],
        Resource: [
          `arn:aws:s3:::${bucketName}/images/*`,
          `arn:aws:s3:::${bucketName}/videos/*`
        ]
      }
    ]
  };
  
  try {
    console.log(`${bucketName} 버킷의 미디어 폴더를 공개 설정 중...`);
    
    // 정책 적용
    const command = new PutBucketPolicyCommand({
      Bucket: bucketName,
      Policy: JSON.stringify(publicReadPolicy)
    });
    
    const result = await s3Client.send(command);
    console.log('성공적으로 images/, videos/ 폴더가 공개 설정되었습니다.');
    return result;
  } catch (error) {
    console.error(`정책 적용 중 오류 발생: ${error.message}`);
    throw error;
  }
}

// 함수를 직접 실행하려면 아래 주석을 해제하세요
// makeMediaFoldersPublic().catch(console.error); 