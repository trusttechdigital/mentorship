const multer = require('multer');
const { s3, bucketName } = require('../config/s3');
const { v4: uuidv4 } = require('uuid');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// Filter for image files, not PDFs
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type, only images are allowed!'), false);
    }
};

// Set up multer with storage, file filter, and size limits
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB file size limit
});

/**
 * Uploads a file to Digital Ocean Spaces.
 * @param {object} file The file object from multer.
 * @returns {Promise<{fileUrl: string, fileKey: string}>} The URL and Key of the uploaded file.
 */
const uploadToSpaces = async (file) => {
    if (!s3 || !bucketName) {
        console.error('S3 is not configured. File upload is disabled.');
        throw new Error('File upload is not configured on the server.');
    }

    const key = `mentee-photos/${uuidv4()}-${file.originalname}`;

    const params = {
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ACL: 'public-read',
        ContentType: file.mimetype,
    };

    try {
        const data = await s3.upload(params).promise();
        return {
            fileUrl: data.Location, // URL of the file
            fileKey: data.Key,      // Key of the file (for deletion)
        };
    } catch (error) {
        console.error('Error in S3 upload: ', error);
        throw new Error('File upload to cloud storage failed.');
    }
};

/**
 * Deletes a file from Digital Ocean Spaces.
 * @param {string} fileKey The Key of the file to delete.
 */
const deleteFromSpaces = async (fileKey) => {
    if (!s3 || !bucketName) {
        console.error('S3 is not configured. File deletion is disabled.');
        // Depending on desired strictness, you might throw an error
        return; 
    }

    const params = {
        Bucket: bucketName,
        Key: fileKey,
    };

    try {
        await s3.deleteObject(params).promise();
    } catch (error) {
        console.error('Error in S3 deletion: ', error);
        // Depending on desired strictness, you might throw an error
    }
};

module.exports = { upload, uploadToSpaces, deleteFromSpaces };
