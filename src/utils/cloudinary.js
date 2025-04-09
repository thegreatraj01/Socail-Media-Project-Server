import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { fileTypeFromFile } from "file-type";  // 👈 NEW
import { ApiError } from "./ApiError.js";
import HTTP_STATUS_CODES from "./httpStatusCodes.js";

// Supported formats (you can expand this list if needed)
const SUPPORTED_IMAGE_TYPES = ["jpg", "jpeg", "png", "webp", "gif", "bmp"];
const SUPPORTED_VIDEO_TYPES = ["mp4", "mov", "avi", "mkv", "webm", "m4v", "3g2"];




const imagesFolder = process.env.NODE_ENV === 'production' ? "CompleteBackend/images" : "ChaiOrCode/images";
const videosFolder = process.env.NODE_ENV === 'production' ? "CompleteBackend/videos" : "ChaiOrCode/videos";

// Upload function
const uploadOnCloudinary = async (localFilePath) => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    try {
        if (!localFilePath) return null;

        // 👇 Detect the actual file type
        const fileType = await fileTypeFromFile(localFilePath);
        if (!fileType) {
            fs.unlinkSync(localFilePath);
            throw new ApiError(HTTP_STATUS_CODES.BAD_REQUEST.code, "Could not determine file type");
        }

        const { ext } = fileType;
        let folderName = null;
        let resourceType = "auto";


        // 👇 Check if it's an image
        if (SUPPORTED_IMAGE_TYPES.includes(ext)) {
            folderName = imagesFolder;
            resourceType = "image";
        }
        // 👇 Check if it's a video
        else if (SUPPORTED_VIDEO_TYPES.includes(ext)) {
            folderName = videosFolder;
            resourceType = "video";
        } else {
            fs.unlinkSync(localFilePath);
            throw new ApiError(HTTP_STATUS_CODES.BAD_REQUEST.code, `Unsupported file type: .${ext}`);
        }


        let response;
        // 👇 Upload to Cloudinary
        if (resourceType == 'image') {
            response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: resourceType,
                folder: folderName,
                transformation: [
                    { width: 1280, height: 720, crop: "scale" }
                ],
            });
        } else if (resourceType == 'video') {
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_large(localFilePath, {
                    resource_type: resourceType,
                    timeout: 600000,
                    folder: folderName,
                    chunk_size: 10 * 1024 * 1024,
                    transformation: [
                        { width: 1280, height: 720, crop: "pad", background: "black" }
                    ],

                }, (error, result) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(result);
                });
            });
            response = result;
        } else {
            console.log('Unexpected resource type in uploadOnCloudinary:', resourceType);
            throw new ApiError(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR.code, "Invalid resource type");
        }


        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath); // cleanup
        console.error("Error during upload:", error);
        throw new ApiError(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR.code, error.message);
    }
};






// ------------------------------------------------------------------------------------

// Function to delete a file from Cloudinary pass old file link as a parameter
const deleteFromCloudinary = async (link) => {
    // Configuration
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const parts = link.split("/"); // Split by "/"
    // Extract the relevant part from the URL (starting from the folder path)
    const publicId = parts.slice(-3).join("/").replace(/\.[^/.]+$/, ""); // Remove the file extension

    try {
        const response = await cloudinary.uploader.destroy(publicId, {});
        // console.log("File deleted successfully:", response);
        return response;
    } catch (error) {
        throw new ApiError(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR.code, error.message);
    }
};







const transformCloudinaryVideo = async (publicId) => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        const result = await cloudinary.uploader.explicit(publicId, {
            resource_type: "video",
            type: "upload",
            eager: [
                {
                    width: 1280,            // 👈 Target width
                    height: 720,            // 👈 Target height
                    aspect_ratio: "16:9",   // 👈 Force 16:9
                    crop: "pad",            // 👈 Pad the video (add black bars if needed)
                    background: "black",    // 👈 Fill with black (like YouTube)
                    format: "mp4"           // 👈 Keep mp4
                }
            ],
            eager_async: true
        });

        return result;
    } catch (error) {
        console.error("Error during video transformation:", error);
        throw new ApiError(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR.code, error.message);
    }
};









export { uploadOnCloudinary, deleteFromCloudinary, transformCloudinaryVideo };
