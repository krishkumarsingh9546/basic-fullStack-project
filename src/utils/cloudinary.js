import { v2 as cloudinary } from "cloudinary"
import fs from "fs"


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});




const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log("file is uploaded on cloudinary", response.url);
        fs.unlinkSync(localFilePath)
        return response
        
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
}


const deleteOnCloudinary = async (imageUrl) => {

    const localFilePath = imageUrl.split('/').slice(-1)[0].split('.')[0];
    try{
        
        const response = await cloudinary.uploader.destroy(localFilePath, {
            resource_type: "image"
        })
        console.log("file is deleted on cloudinary", response);
        return response
    }
    catch(error){
        console.log("file not deleted, Error", error.message || error );
        return null
    }
}




export { uploadOnCloudinary, deleteOnCloudinary }