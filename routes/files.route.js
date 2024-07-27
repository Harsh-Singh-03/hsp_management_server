const express = require('express');
const router = express.Router()
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { ImageUpload, ImageDelete } = require('../controllers/files');
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        if (!fs.existsSync('./uploads')) {
            fs.mkdirSync('./uploads');
        }
        callback(null, './uploads');
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + '_' + file.originalname.replace(/\s/g, '_'));
    }
});

const uploadFile = multer({ storage: storage });

router.post('/files/upload', uploadFile.any(), ImageUpload)
router.post('/files/delete', ImageDelete)

module.exports = router