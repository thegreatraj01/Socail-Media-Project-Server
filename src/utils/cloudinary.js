import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { fileTypeFromFile } from "file-type";  // 👈 NEW
import { ApiError } from "./apiError.js";
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
            });
        } else if (resourceType == 'video') {
            const result = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_large(localFilePath, {
                    resource_type: resourceType,
                    folder: folderName,
                    transformation: [{ width: 1920, height: 1080, crop: "fill" }],
                    chunk_size: 10 * 1024 * 1024,
                }, (error, result) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(result);
                });
            });
            console.log("Cloudinary upload result:", result);
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

export { uploadOnCloudinary, deleteFromCloudinary };
