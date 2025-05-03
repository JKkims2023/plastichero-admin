import { NextResponse } from 'next/server';
import { getConnection } from '../../../lib/db';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

// 이미지 최적화 함수
async function optimizeImage(filePath) {
    const optimizedPath = filePath.replace(/\.\w+$/, '_optimized.jpg');
    await sharp(filePath)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(optimizedPath);
    return path.basename(optimizedPath);
}

export async function POST(req) {
    try {
        const formData = await req.formData();
        
        const title = formData.get('title');
        const description = formData.get('description');
        const commentEnabled = formData.get('comment_flag');
        if (!title || !description) {
            return NextResponse.json({
                result: 'error',
                message: '제목과 내용은 필수 입력사항입니다.'
            }, { status: 400 });
        }

        const connection = await getConnection();

        // 파일 경로 저장을 위한 객체
        const fileData = {};

        // 이미지 파일 처리
        for (let i = 1; i <= 5; i++) {
            const imageFile = formData.get(`image${i}`);
            if (imageFile && typeof imageFile !== 'string') {
                const fileName = `image${i}-${Date.now()}${path.extname(imageFile.name)}`;
                const filePath = path.join('./public/uploads/images', fileName);
                
                // 디렉토리 생성
                await fs.mkdir(path.join('./public/uploads/images'), { recursive: true });
                
                // 파일 저장
                const bytes = await imageFile.arrayBuffer();
                await fs.writeFile(filePath, Buffer.from(bytes));

                // 이미지 최적화
                const optimizedFileName = fileName.replace(/\.\w+$/, '_optimized.jpg');
                const optimizedPath = path.join('./public/uploads/images', optimizedFileName);
                
                await sharp(filePath)
                    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 80 })
                    .toFile(optimizedPath);

                fileData[`notice_picture${i > 1 ? i : ''}`] = optimizedFileName;
            }
        }

        // 비디오 파일 처리
        const videoFile = formData.get('video');
        if (videoFile && typeof videoFile !== 'string') {
            const fileName = `video-${Date.now()}${path.extname(videoFile.name)}`;
            
            // 디렉토리 생성
            await fs.mkdir(path.join('./public/uploads/videos'), { recursive: true });
            
            const filePath = path.join('./public/uploads/videos', fileName);
            const bytes = await videoFile.arrayBuffer();
            await fs.writeFile(filePath, Buffer.from(bytes));

            fileData.notice_movie = fileName;
        }

        // DB 삽입
        const insertData = {
            notice_title: title,
            notice_desctription: description,
            notice_type: '0',
            comment_flag: commentEnabled,
            reg_date: new Date(),
            delete_flag: 'N',
            ...fileData
        };

        const insertQuery = 'INSERT INTO g5_notice SET ?';
        const [result] = await connection.query(insertQuery, [insertData]);

        connection.release();

        return NextResponse.json({ 
            success: true,
            message: '공지사항이 성공적으로 등록되었습니다.',
            result_data: result
        });

    } catch (error) {
        console.error('공지사항 등록 중 오류:', error);
        return NextResponse.json({ 
            success: false,
            message: '공지사항 등록 중 오류가 발생했습니다.' 
        }, { status: 500 });
    }
} 