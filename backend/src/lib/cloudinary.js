import {v2 as cloudinary} from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
    secure:true
});

//Upload image to cloudinary
export const uploadImage = async(filePath) => {
    try {
      const result = await cloudinary.uploader.upload(filePath,{
        folder:'online-bookstore'
      });
      return{
        url:result.secure_url,
        id:result.public_id
      };
    } catch (error) {
       console.error('Error uploading to Cloudinary:', error); 
       throw new Error('Image upload failed')
    }
};


//Delete image from clodinary
export const deleteImage = async(publicId) => {
    try {
      await cloudinary.uploader.destroy(publicId)  
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error); 
        throw new Error('Image deletion failed');
    }
};

export default cloudinary;