const express = require('express');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { upload, avatarUpload } = require('../config/upload');
const authenticate = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Upload file for message
router.post('/message', authenticate, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileUrl = `/uploads/${path.basename(path.dirname(req.file.path))}/${req.file.filename}`;
        let thumbnail = null;

        // Generate thumbnail for images
        if (req.file.mimetype.startsWith('image/')) {
            try {
                const thumbnailFilename = `thumb_${req.file.filename}`;
                const thumbnailPath = path.join(path.dirname(req.file.path), thumbnailFilename);

                await sharp(req.file.path)
                    .resize(200, 200, { fit: 'cover' })
                    .jpeg({ quality: 80 })
                    .toFile(thumbnailPath);

                thumbnail = `/uploads/${path.basename(path.dirname(req.file.path))}/${thumbnailFilename}`;
            } catch (error) {
                logger.error('Thumbnail generation failed:', error);
            }
        }

        res.json({
            fileUrl,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            thumbnail
        });
    } catch (error) {
        logger.error('File upload error:', error);
        res.status(500).json({ error: 'File upload failed' });
    }
});

// Upload avatar
router.post('/avatar', authenticate, avatarUpload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Optimize image
        const optimizedFilename = `optimized_${req.file.filename}`;
        const optimizedPath = path.join(path.dirname(req.file.path), optimizedFilename);

        await sharp(req.file.path)
            .resize(300, 300, { fit: 'cover' })
            .jpeg({ quality: 90 })
            .toFile(optimizedPath);

        // Delete original
        await fs.unlink(req.file.path);

        const avatarUrl = `/uploads/avatars/${optimizedFilename}`;

        // Update user avatar
        req.user.avatar = avatarUrl;
        await req.user.save();

        res.json({
            avatar: avatarUrl,
            user: req.user.toPublicJSON()
        });
    } catch (error) {
        logger.error('Avatar upload error:', error);
        res.status(500).json({ error: 'Avatar upload failed' });
    }
});

// Get file
router.get('/:folder/:filename', (req, res) => {
    const { folder, filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', folder, filename);

    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).json({ error: 'File not found' });
        }
    });
});

module.exports = router;