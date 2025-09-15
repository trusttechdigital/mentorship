const AWS = require('aws-sdk');

// Ensure dotenv is loaded to process environment variables
require('dotenv').config();

const { DO_SPACES_KEY, DO_SPACES_SECRET, DO_SPACES_ENDPOINT, DO_SPACES_BUCKET } = process.env;

let s3 = null;
const bucketName = DO_SPACES_BUCKET;

// A simple check to see if the essential variables are present
if (DO_SPACES_KEY && DO_SPACES_SECRET && DO_SPACES_ENDPOINT && bucketName) {
    console.log('✅ Digital Ocean Spaces credentials found. Configuring S3 client.');

    const spacesEndpoint = new AWS.Endpoint(DO_SPACES_ENDPOINT);
    
    s3 = new AWS.S3({
        endpoint: spacesEndpoint,
        accessKeyId: DO_SPACES_KEY,
        secretAccessKey: DO_SPACES_SECRET
    });
    
    console.log('✅ S3 client configured successfully for bucket:', bucketName);

} else {
    console.error('❌ Digital Ocean Spaces environment variables are missing or incomplete.');
    console.error('File uploads will be disabled. Please check your .env file.');
    // s3 remains null, which will be handled by the uploader utility
}

module.exports = { s3, bucketName };
