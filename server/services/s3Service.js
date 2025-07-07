console.log("S3 Bucket:", process.env.AWS_S3_BUCKET);
const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID_2,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_2,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

if (!process.env.AWS_S3_BUCKET) {
  throw new Error("AWS_S3_BUCKET is not defined in the environment variables.");
}

// Configure multer for S3 upload
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    acl: "private", // Files are private by default
    key: function (req, file, cb) {
      // Generate unique filename with timestamp and UUID
      const uniqueName = `tickets/${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
    metadata: function (req, file, cb) {
      cb(null, {
        fieldName: file.fieldname,
        originalName: file.originalname,
        uploadedBy: req.user ? req.user.id.toString() : "unknown",
      });
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5, // Maximum 5 files per upload
  },
  fileFilter: function (req, file, cb) {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only allowed file types are permitted!"));
    }
  },
});

// Function to delete file from S3
const deleteFile = async (fileKey) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileKey,
    };

    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    return false;
  }
};

// Function to get signed URL for file download
const getSignedUrl = (fileKey, expires = 3600) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileKey,
      Expires: expires, // URL expires in 1 hour by default
    };

    return s3.getSignedUrl("getObject", params);
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return null;
  }
};

module.exports = {
  upload,
  deleteFile,
  getSignedUrl,
  s3,
};
