const cloudinary = require('cloudinary').v2;
const fs = require('fs');
// Fucntion for deleting files
const DeleteFile = async (files) => {
    if (!files || files.length === 0) return false
    try {
        await Promise.all(files.map(async (url) => {
            const parts = url.split('/');
            const publicIdWithExtension = parts.pop();
            const publicId = publicIdWithExtension.split('.')[0];

            await cloudinary.uploader.destroy(publicId);
        }));
        return true
    } catch (error) {
        console.log(error.message);
        return false
    }
}
// Function to upload a single image to Cloudinary
const uploadSingleImage = async (file) => {
    try {
        if (!file || !file.path) {
            return null;
        }
        const result = await cloudinary.uploader.upload(file.path);
        return result.secure_url || result.url;
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        return null;
    }
};

const removeFilesFromMemory = async (file) => {
    try {
        if (file && file.path && fs.existsSync(file.path)) {
            console.log(file.path)
            await fs.promises.unlink(file.path);
        }
    } catch (error) {
        console.log(error);
        return;
    }
};

module.exports = { DeleteFile, uploadSingleImage, removeFilesFromMemory }