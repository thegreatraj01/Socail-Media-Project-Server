import { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
import HTTP_STATUS_CODES from "../utils/httpStatusCodes.js"


// DONE:  API Testing ✅ (Completed)
const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query = "",
        sortByDate = "newest",
        sortByDuration,
        sortByViews,
        userId,
    } = req.query;

    // Validate page and limit
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    if (isNaN(pageNumber) || pageNumber < 1) {
        throw new ApiError(HTTP_STATUS_CODES.BAD_REQUEST.code, "Invalid 'page' value. Must be a number ≥ 1.");
    }

    if (isNaN(pageSize) || pageSize < 1) {
        throw new ApiError(HTTP_STATUS_CODES.BAD_REQUEST.code, "Invalid 'limit' value. Must be a number ≥ 1.");
    }

    const skip = (pageNumber - 1) * pageSize;

    const filter = { isPublished: true };

    // Full-text search
    if (query) {
        filter.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }

    // Validate and apply userId
    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(HTTP_STATUS_CODES.BAD_REQUEST.code, "Invalid 'userId'. Must be a valid MongoDB ObjectId.");
        }
        filter.owner = userId;
    }

    // Sort options mapping
    const sortOptions = {};

    // Date sorting
    if (sortByDate) {
        if (sortByDate === "newest") {
            sortOptions.createdAt = -1;
        } else if (sortByDate === "oldest") {
            sortOptions.createdAt = 1;
        } else {
            throw new ApiError(
                HTTP_STATUS_CODES.BAD_REQUEST.code,
                "Invalid 'sortByDate'. Accepted values: newest, oldest"
            );
        }
    }

    // Duration sorting
    if (sortByDuration) {
        if (sortByDuration === "shortest") {
            sortOptions.duration = 1;
        } else if (sortByDuration === "longest") {
            sortOptions.duration = -1;
        } else {
            throw new ApiError(
                HTTP_STATUS_CODES.BAD_REQUEST.code,
                "Invalid 'sortByDuration'. Accepted values: shortest, longest"
            );
        }
    }

    // Views sorting
    if (sortByViews) {
        if (sortByViews === "highToLow") {
            sortOptions.views = -1;
        } else if (sortByViews === "lowToHigh") {
            sortOptions.views = 1;
        } else {
            throw new ApiError(
                HTTP_STATUS_CODES.BAD_REQUEST.code,
                "Invalid 'sortByViews'. Accepted values: highToLow, lowToHigh"
            );
        }
    }

    const totalVideos = await Video.countDocuments(filter);

    const videos = await Video.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(pageSize)
        .populate("owner", "username avatar")
        .lean();

    return res.status(HTTP_STATUS_CODES.OK.code).json(
        new ApiResponse(HTTP_STATUS_CODES.OK.code, {
            page: pageNumber,
            limit: pageSize,
            totalResults: totalVideos,
            totalPages: Math.ceil(totalVideos / pageSize),
            results: videos
        }, "Videos fetched successfully")
    );
});


// DONE:  API Testing ✅ (Completed)
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

// DONE:  API Testing ✅ (Completed)
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    console.log()

    // Validate video ID
    if (!isValidObjectId(videoId)) {
        throw new ApiError(
            HTTP_STATUS_CODES.BAD_REQUEST.code,
            "Invalid video ID"
        );
    }

    // Find video and populate the owner details
    const video = await Video.findById(videoId)
        .populate("owner", "username avatar")
        .lean();

    // If video not found or unpublished
    if (!video || !video.isPublished) {
        throw new ApiError(
            HTTP_STATUS_CODES.NOT_FOUND.code,
            "Video not found"
        );
    }

    return res.status(HTTP_STATUS_CODES.OK.code).json(
        new ApiResponse(HTTP_STATUS_CODES.OK.code, video, "Video fetched successfully")
    );
});


// DONE:  API Testing ✅ (Completed)
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const newThumbnail = req.file;
    const { title, description } = req.body;

    if (!(newThumbnail || title || description)) {
        throw new ApiError(HTTP_STATUS_CODES.BAD_REQUEST.code, "give any feild to update thumbnail , title or description");
    }

    console.log(newThumbnail);

    if (!videoId) {
        throw new ApiError(HTTP_STATUS_CODES.BAD_REQUEST.code, "Please give a video id");

    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(HTTP_STATUS_CODES.BAD_REQUEST.code, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(HTTP_STATUS_CODES.NOT_FOUND.code, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(HTTP_STATUS_CODES.FORBIDDEN.code, "You are not authorized to modify video details ");
    }


    if (newThumbnail) {
        const oldThumbnail = video.thumbnail;
        const response = await uploadOnCloudinary(newThumbnail.path);
        await deleteFromCloudinary(oldThumbnail);
        video.thumbnail = response.secure_url;
    };

    if (title) {
        video.title = title;
    }
    if (description) {
        video.description = description;
    }

    const updatedVideo = await video.save();


    res.status(HTTP_STATUS_CODES.OK.code).json(
        new ApiResponse(
            HTTP_STATUS_CODES.OK.code,
            updatedVideo,
            "video updated successfully"
        )
    )

})

// DONE:  API Testing ✅ (Completed)
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(HTTP_STATUS_CODES.BAD_REQUEST.code, "Please give a video id");

    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(HTTP_STATUS_CODES.BAD_REQUEST.code, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(HTTP_STATUS_CODES.NOT_FOUND.code, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(HTTP_STATUS_CODES.FORBIDDEN.code, "You are not authorized to delete this video");
    }

    await deleteFromCloudinary(video.videoFile);
    await deleteFromCloudinary(video.thumbnail);

    // 5. Delete the video document
    await video.deleteOne();

    return res.status(HTTP_STATUS_CODES.OK.code).json(
        new ApiResponse(HTTP_STATUS_CODES.OK.code, null, "Video deleted successfully")
    );
});

// DONE:  API Testing ✅ (Completed)
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(HTTP_STATUS_CODES.BAD_REQUEST.code, "Please give a video id");

    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(HTTP_STATUS_CODES.BAD_REQUEST.code, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(HTTP_STATUS_CODES.NOT_FOUND.code, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(HTTP_STATUS_CODES.FORBIDDEN.code, "You are not authorized to modify publish status this video");
    }

    const currentStatus = video.isPublished;

    video.isPublished = !currentStatus;

    const newStatus = await video.save()


    res.status(HTTP_STATUS_CODES.OK.code).json(
        new ApiResponse(
            HTTP_STATUS_CODES.OK.code,
            newStatus,
            "Video status changed successfully"
        )
    )



})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
