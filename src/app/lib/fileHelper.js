/**
 * S3 파일 URL을 가져오는 함수
 * @param {string} key - S3에 저장된 파일 키 또는 URL
 * @returns {string} - 파일 URL
 */
export function getFileUrl(key) {
    if (!key) return '';
    
    // 이미 URL인지 확인 (http로 시작하는 경우)
    if (key.startsWith('http')) {
        return key; // 이미 전체 URL이면 그대로 반환
    }
    
    // S3 경로인지 확인 (images/ 또는 videos/로 시작하는 경우)
    if (key.startsWith('images/') || key.startsWith('videos/')) {
        // 이제 API가 직접 S3 URL로 리다이렉트하므로 API URL을 그대로 반환
        return `/api/file?key=${encodeURIComponent(key)}`;
    } else {
        // 기존 로컬 파일 경로 처리 (이전 데이터와의 호환성 유지)
        if (key.includes('video')) {
            return `/uploads/videos/${key}`;
        } else {
            return `/uploads/images/${key}`;
        }
    }
}

/**
 * 이미지 URL을 가져오는 함수
 * @param {string} key - 이미지 키 또는 URL
 * @returns {string} - 이미지 URL
 */
export function getImageUrl(key) {
    return getFileUrl(key);
}

/**
 * 비디오 URL을 가져오는 함수
 * @param {string} key - 비디오 키 또는 URL
 * @returns {string} - 비디오 URL
 */
export function getVideoUrl(key) {
    return getFileUrl(key);
}

/**
 * 파일이 S3에 저장된 것인지 확인하는 함수
 * @param {string} key - 파일 키 또는 URL
 * @returns {boolean} - S3 파일 여부
 */
export function isS3File(key) {
    if (!key) return false;
    // URL 형태로 저장된 경우에도 S3 파일로 인식
    return key.startsWith('images/') || key.startsWith('videos/') || 
           (key.startsWith('http') && key.includes('amazonaws.com'));
} 