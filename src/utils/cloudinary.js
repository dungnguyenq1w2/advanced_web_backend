const cloudinary = require('cloudinary').v2
const cloudinaryConfig = require('../common/config/cloudinary.config')

cloudinary.config({
    cloud_name: cloudinaryConfig.CLOUDINARY_NAME,
    api_key: cloudinaryConfig.CLOUDINARY_API_KEY,
    api_secret: cloudinaryConfig.CLOUDINARY_API_SECRET,
})

const uploadImage = async (url) => {
    try {
        return await cloudinary.uploader
            .upload(url, { allowed_formats: ['png', 'jpg'] })
            .then((result) => result.url)
    } catch (error) {
        console.log("Upload: ", error)
        return error
    }
}
module.exports = { uploadImage }
