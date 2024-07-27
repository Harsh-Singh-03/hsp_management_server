const { removeFilesFromMemory, uploadSingleImage, DeleteFile } = require("../utilities/file-operation")


const ImageUpload = async (req, res) => {
    try {
        if (!req.files) return res.status(400).send({ success: false, message: 'Files not found' })
        console.log(req.files)
        const filesUrl = await uploadSingleImage(req?.files[0])
        console.log(filesUrl)
        if (!filesUrl) return res.status(404).send({ success: false, message: 'Files not found' })
        return res.status(200).send({ success: true, message: 'files uploaded successfully', data: filesUrl })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ success: false, message: 'Internal server error' })
    } finally {
        removeFilesFromMemory(req?.files[0])
    }
}

const ImageDelete = async (req, res) => {
    try {
        const filesUrl = req.body.files
        if(filesUrl){
            const deletedFiles = await DeleteFile(filesUrl)
            if(deletedFiles === true){
                res.status(200).send({ success: true, message: 'files deleted successfully' })
            }else{
                res.status(404).send({ success: false, message: 'files not found' })
            }
        }else{
            res.status(404).send({ success: false, message: 'files not found' })
        }
    } catch (error) {
        res.status(500).send({ success: false, message: 'server error' })
    }
}

module.exports = {
    ImageUpload,
    ImageDelete
}