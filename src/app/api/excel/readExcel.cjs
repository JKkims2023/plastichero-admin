const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// 프로젝트 루트 경로 구하기
const rootDir = process.cwd();
const excelFilePath = path.join(rootDir, 'restore.xlsx');

// 파일이 존재하는지 확인
if (!fs.existsSync(excelFilePath)) {
  console.error('파일을 찾을 수 없습니다.');
  process.exit(1);
}

// 엑셀 파일 읽기
try {
  const fileBuffer = fs.readFileSync(excelFilePath);
  const workbook = XLSX.read(fileBuffer);
  
  // 모든 시트 이름 출력
  console.log('엑셀 시트 이름:', workbook.SheetNames);
  
  // 첫 번째 시트의 데이터 읽기
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  // 시트 데이터 구조 확인
  console.log('시트 데이터 구조:');
  const data = XLSX.utils.sheet_to_json(sheet);
  
  if (data.length > 0) {
    console.log('첫 번째 행의 키:', Object.keys(data[0]));
    console.log('첫 번째 행의 데이터:', data[0]);
    
    // 실제 데이터의 몇 개 행 출력
    console.log('첫 5개 행 데이터:');
    data.slice(0, 5).forEach((row, index) => {
      console.log(`행 ${index + 1}:`, row);
    });
    
    console.log(`총 ${data.length}개의 행이 있습니다.`);
  } else {
    console.log('데이터가 없습니다.');
  }
} catch (error) {
  console.error('엑셀 파일을 읽는 중 오류 발생:', error);
} 