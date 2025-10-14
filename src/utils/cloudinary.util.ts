import { v2 as cloudinary } from 'cloudinary';

export async function deleteImageFromCloudinary(imageUrl: string) {
    try {
        if (!imageUrl) return;

        const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy(`posts/${publicId}`);
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
    }
}
