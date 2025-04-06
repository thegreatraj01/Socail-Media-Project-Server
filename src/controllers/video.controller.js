import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import User from "../models/user.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import HTTP_STATUS_CODES from "../utils/httpStatusCodes.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    // Check title and description
    if (!(title && description)) {
        throw new ApiError(
            HTTP_STATUS_CODES.BAD_REQUEST.code,
            "Title and description are required"
        );
    }

    // Extract file paths and size
    const videoFileRaw = req.files?.videoFile?.[0];
    const thumbnailRaw = req.files?.thumbnail?.[0];

    if (!videoFileRaw || !thumbnailRaw) {
        throw new ApiError(
            HTTP_STATUS_CODES.BAD_REQUEST.code,
            "Video file and thumbnail are required"
        );
    }

    const videoFilePath = videoFileRaw.path;
    const thumbnailPath = thumbnailRaw.path;

    // Check MIME type to ensure videoFile is actually a video
    if (!videoFileRaw.mimetype.startsWith("video/")) {
        throw new ApiError(
            HTTP_STATUS_CODES.BAD_REQUEST.code,
            "Uploaded video file must be a valid video format"
        );
    }

    const maxThumbnailSize = 5 * 1024 * 1024; // 5MB
    const maxVideoSize = 100 * 1024 * 1024;   // 100MB

    if (thumbnailRaw.size > maxThumbnailSize) {
        throw new ApiError(
            HTTP_STATUS_CODES.BAD_REQUEST.code,
            "Thumbnail size must be less than 5MB"
        );
    }

    if (videoFileRaw.size > maxVideoSize) {
        throw new ApiError(
            HTTP_STATUS_CODES.BAD_REQUEST.code,
            "Video size must be less than 100MB"
        );
    }

    let Cvideo, Cthumbnail = null;
    // Upload to Cloudinary in parallel
    try {
        [Cvideo, Cthumbnail] = await Promise.all([
            uploadOnCloudinary(videoFilePath),
            uploadOnCloudinary(thumbnailPath)
        ]);
    } catch (error) {
        // console.log(error)
        throw new ApiError(HTTP_STATUS_CODES.BAD_REQUEST.code, error.message);
    }

    if (!Cthumbnail || !Cvideo) {
        throw new ApiError(
            HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR.code,
            "Image or video not uploaded"
        );
    }

    // Create video in DB
    const video = await Video.create({
        title,
        description,
        thumbnail: Cthumbnail.secure_url,
        videoFile: Cvideo.playback_url,
        owner: req.user._id,
        isPublished: true,
        duration: Cvideo.duration
    });

    // Send response
    res.status(HTTP_STATUS_CODES.CREATED.code).json(
        new ApiResponse(
            HTTP_STATUS_CODES.CREATED.code,
            video,
            "Video uploaded successfully"
        )
    );
});



const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
