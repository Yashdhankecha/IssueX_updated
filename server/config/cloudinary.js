const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');

// Debug logging
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.warn('⚠️ Cloudinary environment variables are missing! Check your .env file.');
} else {
    console.log('✅ Cloudinary configuration loaded for cloud:', process.env.CLOUDINARY_CLOUD_NAME);
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Custom storage engine for multer that works with Cloudinary v2
class CloudinaryStorage {
    constructor(opts) {
        this.cloudinary = opts.cloudinary;
        this.params = opts.params || {};
    }

    _handleFile(req, file, cb) {
        const params = {
            folder: this.params.folder || 'uploads',
            allowed_formats: this.params.allowed_formats || ['jpg', 'png', 'jpeg', 'webp'],
            transformation: this.params.transformation || [{ width: 1000, height: 1000, crop: 'limit' }]
        };

        const uploadStream = this.cloudinary.uploader.upload_stream(
            {
                folder: params.folder,
                allowed_formats: params.allowed_formats,
                transformation: params.transformation
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return cb(error);
                }
                cb(null, {
                    path: result.secure_url,
                    filename: result.public_id,
                    size: result.bytes,
                    format: result.format,
                    width: result.width,
                    height: result.height
                });
            }
        );

        file.stream.pipe(uploadStream);
    }

    _removeFile(req, file, cb) {
        if (file.filename) {
            this.cloudinary.uploader.destroy(file.filename, (error, result) => {
                cb(error);
            });
        } else {
            cb(null);
        }
    }
}

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'civic_issue_tracker',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    }
});

console.log('✅ Cloudinary Storage Initialized');

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
