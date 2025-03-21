import { NextResponse } from 'next/server';
import { getConnection } from '../../../lib/db';

export async function POST(request) {
    let conn = null;
    
    try {
        const body = await request.json();
        const { noticeId } = body;

        if (!noticeId) {
            return NextResponse.json({ 
                success: false, 
                message: '삭제할 공지사항 ID가 필요합니다.' 
            });
        }

        conn = await getConnection();

        const sql = `
    
            UPDATE g5_notice SET delete_flag = 'Y' WHERE notice_no = ${noticeId}
  
      `;
  
      const [rows, fields] = await conn.execute(sql);
  

        if (rows.affectedRows === 0) {
            return NextResponse.json({ 
                success: false, 
                message: '해당 공지사항을 찾을 수 없습니다.' 
            });
        }

        return NextResponse.json({ 
            success: true, 
            message: '공지사항이 성공적으로 삭제되었습니다.' 
        });

    } catch (error) {
        console.error('공지사항 삭제 중 오류 발생:', error);
        return NextResponse.json({ 
            success: false, 
            message: '공지사항 삭제 중 오류가 발생했습니다.' 
        }, { 
            status: 500 
        });
    } finally {
        if (conn) {
            try {
                await conn.release();
            } catch (error) {
                console.error('Connection release error:', error);
            }
        }
    }
} 