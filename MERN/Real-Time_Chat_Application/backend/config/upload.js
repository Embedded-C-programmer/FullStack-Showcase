const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'others';

        if (file.mimetype.startsWith('image/')) {
            folder = 'images';
        } else if (file.mimetype.startsWith('video/')) {
            folder = 'videos';
        } else if (file.mimetype.startsWith('audio/')) {
            folder = 'audio';
        } else if (file.mimetype === 'application/pdf') {
            folder = 'documents';
        }

        const uploadPath = path.join(uploadsDir, folder);
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'application/zip'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images, videos, audio, documents, and archives are allowed.'), false);
    }
};

// Multer upload configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Avatar upload (smaller size limit)
const avatarUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const avatarsPath = path.join(uploadsDir, 'avatars');
            if (!fs.existsSync(avatarsPath)) {
                fs.mkdirSync(avatarsPath, { recursive: true });
            }
            cb(null, avatarsPath);
        },
        filename: (req, file, cb) => {
            cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed for avatars'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit for avatars
    }
});

module.exports = { upload, avatarUpload };