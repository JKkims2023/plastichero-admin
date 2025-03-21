import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Multer 관련 타입 정의
interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = file.fieldname.startsWith('image') 
            ? './public/uploads/images' 
            : './public/uploads/videos';
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const uniqueFileName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueFileName);
    }
});

const fileFilter = (req: any, file: MulterFile, cb: multer.FileFilterCallback) => {
    if (file.fieldname.startsWith('image')) {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('이미지 파일만 업로드 가능합니다.'));
        }
    } else if (file.fieldname === 'video') {
        if (!file.mimetype.startsWith('video/')) {
            return cb(new Error('비디오 파일만 업로드 가능합니다.'));
        }
    }
    cb(null, true);
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
    }
}); 