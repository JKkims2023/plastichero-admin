// src/app/api/excel/route.js
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    // 프로젝트 루트 경로 구하기
    const rootDir = process.cwd();
    const excelFilePath = path.join(rootDir, 'restore.xlsx');
    
    // 파일이 존재하는지 확인
    if (!fs.existsSync(excelFilePath)) {
      return NextResponse.json({ message: '파일을 찾을 수 없습니다.' }, { status: 404 });
    }
    
    // 엑셀 파일 읽기
    const fileBuffer = fs.readFileSync(excelFilePath);
    const workbook = XLSX.read(fileBuffer);
    const sheetName = workbook.SheetNames[0]; // 첫 번째 시트 이름 가져오기
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    // MySQL 연결 설정
    const DB_HOST='49.247.43.209';
    const DB_PORT=3306;
    const DB_USER='ecocentre0';
    const DB_PASSWORD='eco_centre0@@';
    const DB_DATABASE='ecocentre0';
    
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_DATABASE,
    });
    
    // 엑셀 데이터를 DB에 업데이트
    let updatedCount = 0;
    const results = [];

    for (const row of data) {
      // 엑셀에서 확인된 구조에 맞게 데이터 추출
      const keys = Object.keys(row);
      
      // 키가 3개가 아니면 건너뛰기
      if (keys.length !== 3) {
        results.push({
          status: 'skipped',
          reason: '행의 데이터 구조가 올바르지 않습니다.',
          data: row
        });
        continue;
      }
      
      const recoveryAmount = row['1000']; // 첫 번째 열 값
      const walletAddress = keys[1]; // 두 번째 열 키 (지갑 주소)
      const useableSwapAmount = row['1000_1']; // 세 번째 열 값
      
      // SQL 쿼리 실행
      try {
        const updateQuery = `UPDATE tbl_pth_wallet_info SET 
          recovery_amount = ?,
          useable_swap_amount = ?,
          import_status = 'Y'
          WHERE address = ?`;
        

        console.log(updateQuery);

        
        const [result] = await connection.execute(updateQuery, [
          recoveryAmount,
          useableSwapAmount,
          walletAddress
        ]);
        
        if (result.affectedRows > 0) {
          updatedCount++;
          results.push({
            status: 'success',
            walletAddress,
            recoveryAmount,
            useableSwapAmount,
            affected: result.affectedRows
          });
        } else {
          results.push({
            status: 'no-update',
            walletAddress,
            recoveryAmount,
            useableSwapAmount,
            affected: 0
          });
        }
        
      } catch (err) {
        console.error('행 업데이트 중 오류:', err);
        results.push({
          status: 'error',
          walletAddress,
          recoveryAmount,
          useableSwapAmount,
          error: err.message
        });
      }
    }
    
    // 연결 종료
    await connection.end();
    
    return NextResponse.json({ 
      message: 'Data imported successfully!',
      totalRows: data.length,
      updatedRows: updatedCount,
      results: results.slice(0, 10) // 최대 10개 결과만 반환
    }, { status: 200 });
    
  } catch (error) {
    console.error('파일 처리 중 오류:', error);
    return NextResponse.json({ message: 'Error importing data', error: error.message }, { status: 500 });
  }
}

/*
export async function POST(request) {
  if (request.method === 'POST') {
    try {
      // FormData로 파일 읽기
      const formData = await request.formData();
      const file = formData.get('excelFile');
      
      if (!file) {
        return NextResponse.json({ message: '파일이 업로드되지 않았습니다.' }, { status: 400 });
      }

      // ArrayBuffer로 변환
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
      
      const sheetName = workbook.SheetNames[0]; // 첫 번째 시트 이름 가져오기
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);

      const DB_HOST='49.247.43.209';
      const DB_PORT=3306;
      const DB_USER='ecocentre0';
      const DB_PASSWORD='eco_centre0@@';
      const DB_DATABASE='ecocentre0';

      // MySQL 연결 설정
      const connection = await mysql.createConnection({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_DATABASE,
      });

      // 데이터베이스에 업데이트
      let updatedCount = 0;
      const results = [];

      for (const row of data) {
        // 엑셀에서 확인된 구조에 맞게 데이터 추출
        const keys = Object.keys(row);
        
        // 키가 3개가 아니면 건너뛰기
        if (keys.length !== 3) {
          results.push({
            status: 'skipped',
            reason: '행의 데이터 구조가 올바르지 않습니다.',
            data: row
          });
          continue;
        }
        
        const recoveryAmount = row['1000']; // 첫 번째 열 값
        const walletAddress = keys[1]; // 두 번째 열 키 (지갑 주소)
        const useableSwapAmount = row['1000_1']; // 세 번째 열 값
        
        // SQL 쿼리 실행
        try {
          const updateQuery = `UPDATE TBL_PTH_WALLET_INFO SET 
            recovery_amount = ?,
            useable_swap_amount = ?
            WHERE address = ?`;
          
          const [result] = await connection.execute(updateQuery, [
            recoveryAmount,
            useableSwapAmount,
            walletAddress
          ]);
          
          if (result.affectedRows > 0) {
            updatedCount++;
            results.push({
              status: 'success',
              walletAddress,
              recoveryAmount,
              useableSwapAmount,
              affected: result.affectedRows
            });
          } else {
            results.push({
              status: 'no-update',
              walletAddress,
              recoveryAmount,
              useableSwapAmount,
              affected: 0
            });
          }
        } catch (err) {
          console.error('행 업데이트 중 오류:', err);
          results.push({
            status: 'error',
            walletAddress,
            recoveryAmount,
            useableSwapAmount,
            error: err.message
          });
        }
      }

      // 연결 종료
      await connection.end();

      return NextResponse.json({ 
        message: 'Data imported successfully!',
        totalRows: data.length,
        updatedRows: updatedCount,
        results: results.slice(0, 10) // 최대 10개 결과만 반환
      }, { status: 200 });

    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: 'Error importing data', error: error.message }, { status: 500 });
    }
  } else {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
  }
}
*/

// Next.js API Route에서 파일 업로드를 처리하기 위한 설정
export const config = {
  api: {
    bodyParser: false, // bodyParser 비활성화 (파일 업로드 시 필요)
  },
};