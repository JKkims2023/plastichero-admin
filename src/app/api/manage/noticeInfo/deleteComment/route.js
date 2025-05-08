import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request) {
  try {
    const body = await request.json();
    const { comment_no } = body;
    
    if (!comment_no) {
      return NextResponse.json({ 
        success: false, 
        message: '필수 파라미터가 누락되었습니다.' 
      }, { status: 400 });
    }

    // MySQL 연결 설정
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '49.247.43.209',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'ecocentre0',
      password: process.env.DB_PASSWORD || 'eco_centre0@@',
      database: process.env.DB_DATABASE || 'ecocentre0',
    });

    // 실제로 데이터베이스에서 삭제하는 대신, delete_flag = 'Y'로 설정하여 논리적 삭제
    const updateQuery = `
      UPDATE g5_notice_comment 
      SET delete_flag = 'Y' 
      WHERE comment_no = ?
    `;

    const [result] = await connection.execute(updateQuery, [comment_no]);
    await connection.end();

    if (result.affectedRows > 0) {
      return NextResponse.json({ 
        success: true,
        message: '댓글이 성공적으로 삭제되었습니다.',
        comment_no
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: '댓글을 찾을 수 없거나 삭제할 수 없습니다.' 
      }, { status: 404 });
    }
  } catch (error) {
    console.error('댓글 삭제 오류:', error);
    return NextResponse.json({ 
      success: false, 
      message: '댓글 삭제 중 오류가 발생했습니다.',
      error: error.message
    }, { status: 500 });
  }
} 