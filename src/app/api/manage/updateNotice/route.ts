import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '../../../lib/db';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import multer from 'multer';

// multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = file.fieldname.startsWith('image') 
            ? './public/uploads/images' 
            : './public/uploads/videos';
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// 이미지 최적화 함수
async function optimizeImage(filePath: string) {
    const optimizedPath = filePath.replace(/\.\w+$/, '_optimized.jpg');
    await sharp(filePath)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(optimizedPath);
    return path.basename(optimizedPath);
}

// POST 메서드 핸들러
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        
        const noticeId = formData.get('noticeId');
        const title = formData.get('title');
        const description = formData.get('description');
        const commentEnabled = formData.get('comment_flag');
        const connection = await getConnection();


        // 기존 파일 정보 조회
        const [existingNotice] = await connection.execute(
            'SELECT notice_picture, notice_picture2, notice_picture3, notice_picture4, notice_picture5, notice_movie FROM g5_notice WHERE notice_no = ?',
            [noticeId]
        );

        // 새로운 파일 경로 저장을 위한 객체
        const fileUpdates = {};

        // 이미지 파일 처리
        for (let i = 1; i <= 5; i++) {
            const imageFile = formData.get(`image${i}`);
            if (imageFile) {
                // @ts-ignore
                const fileName = `image${i}-${Date.now()}${path.extname(imageFile.name)}`;
                const filePath = path.join('./public/uploads/images', fileName);
                
                // 파일 저장
                // @ts-ignore
                const bytes = await imageFile.arrayBuffer();
                await fs.writeFile(filePath, Buffer.from(bytes));

                // 이미지 최적화
                const optimizedFileName = fileName.replace(/\.\w+$/, '_optimized.jpg');
                const optimizedPath = path.join('./public/uploads/images', optimizedFileName);
                
                await sharp(filePath)
                    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 80 })
                    .toFile(optimizedPath);

                fileUpdates[`notice_picture${i > 1 ? i : ''}`] = optimizedFileName;

                // 기존 파일 삭제
                if (existingNotice[0][`notice_picture${i > 1 ? i : ''}`]) {
                    try {
                        await fs.unlink(path.join('./public/uploads/images', existingNotice[0][`notice_picture${i > 1 ? i : ''}`]));
                    } catch (error) {
                        console.error(`기존 이미지 삭제 실패: ${error}`);
                    }
                }
            }
        }

        // 비디오 파일 처리
        const videoFile = formData.get('video');
        if (videoFile) {
            // @ts-ignore
            const fileName = `video-${Date.now()}${path.extname(videoFile.name)}`;
            const filePath = path.join('./public/uploads/videos', fileName);
            
            // 파일 저장
            // @ts-ignore
            const bytes = await videoFile.arrayBuffer();
            await fs.writeFile(filePath, Buffer.from(bytes));

            // @ts-ignore
            fileUpdates.notice_movie = fileName;

            // 기존 비디오 파일 삭제
            if (existingNotice[0].notice_movie) {
                try {
                    await fs.unlink(path.join('./public/uploads/videos', existingNotice[0].notice_movie));
                } catch (error) {
                    console.error(`기존 비디오 삭제 실패: ${error}`);
                }
            }
        }

        // DB 업데이트
        const updateFields = {
            notice_title: title,
            notice_desctription: description,
            comment_flag: commentEnabled,
            ...fileUpdates
        };

        const updateQuery = 'UPDATE g5_notice SET ? WHERE notice_no = ?';
        await connection.query(updateQuery, [updateFields, noticeId]);

        connection.release(); // 연결 반환

        return NextResponse.json({ 
            success: true, 
            message: '공지사항이 성공적으로 수정되었습니다.' 
        });

    } catch (error) {
        console.error('공지사항 수정 중 오류:', error);
        return NextResponse.json({ 
            success: false, 
            message: '공지사항 수정 중 오류가 발생했습니다.' 
        }, { status: 500 });
    }
}

// GET 메서드 핸들러 (필요한 경우)
export async function GET() {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
} 