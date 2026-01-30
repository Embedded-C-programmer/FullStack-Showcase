import api from './api';

class UploadService {
    async uploadFile(file, onProgress) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/upload/message', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    if (onProgress) {
                        onProgress(percentCompleted);
                    }
                }
            });

            return response.data;
        } catch (error) {
            console.error('File upload error:', error);
            throw error;
        }
    }

    async uploadAvatar(file) {
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await api.post('/upload/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Avatar upload error:', error);
            throw error;
        }
    }

    getFileType(mimeType) {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType.startsWith('audio/')) return 'audio';
        if (mimeType === 'application/pdf') return 'pdf';
        return 'file';
    }

    getFileIcon(mimeType) {
        const type = this.getFileType(mimeType);

        const icons = {
            image: '🖼️',
            video: '🎥',
            audio: '🎵',
            pdf: '📄',
            file: '📎'
        };

        return icons[type] || icons.file;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    isImage(mimeType) {
        return mimeType.startsWith('image/');
    }

    isVideo(mimeType) {
        return mimeType.startsWith('video/');
    }

    isAudio(mimeType) {
        return mimeType.startsWith('audio/');
    }

    validateFile(file, maxSize = 50 * 1024 * 1024) { // 50MB default
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

        if (!allowedTypes.includes(file.type)) {
            throw new Error('File type not supported');
        }

        if (file.size > maxSize) {
            throw new Error(`File size must be less than ${this.formatFileSize(maxSize)}`);
        }

        return true;
    }
}

const uploadService = new UploadService();
export default uploadService;