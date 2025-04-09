import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import HTTP_STATUS_CODES from "../utils/httpStatusCodes.js"
import { Video } from "../models/video.model.js"


// DONE:  API Testing ✅ (Completed)
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    let { page, limit } = req.query;
    if (page === undefined || page === '') page = 1;
    if (limit === undefined || limit === '') limit = 10;

    if (isNaN(page) || isNaN(limit)) {
        throw new ApiError(
            HTTP_STATUS_CODES.BAD_REQUEST.code,
            "Page and limit must be valid numbers"
        );
    };

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(HTTP_STATUS_CODES.BAD_REQUEST.code, "Its not a valid video id ");
    };

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(HTTP_STATUS_CODES.NOT_FOUND.code, "video not found ");
    };

    const totalComments = await Comment.countDocuments({ video: videoId });

    const comments = await Comment.find({ video: videoId })
        .populate("owner", "userName avatar -_id")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    res.status(HTTP_STATUS_CODES.OK.code).json(
        new ApiResponse(
            HTTP_STATUS_CODES.OK.code,
            {
                page: pageNumber,
                limit: pageSize,
                totalResults: totalComments,
                totalPages: Math.ceil(totalComments / pageSize),
                results: comments
            },
            "Comments fetched successfully"
        )
    );


})

// DONE:  API Testing ✅ (Completed)
const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    if (!videoId) {
        throw new ApiError(HTTP_STATUS_CODES.BAD_REQUEST.code, "Video ID is required in params")
    };
    if (!isValidObjectId(videoId)) {
        throw new ApiError(HTTP_STATUS_CODES.BAD_REQUEST.code, "Invalid videoId");
    };

    if (!content || content.trim().length < 1) {
        throw new ApiError(HTTP_STATUS_CODES.BAD_REQUEST.code, "Comment cannot be empty");
    };
    if (content.trim().length > 5000) {
        throw new ApiError(HTTP_STATUS_CODES.BAD_REQUEST.code, "Comment is too long");
    };

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(HTTP_STATUS_CODES.NOT_FOUND.code, "video not found");
    }

    let comment = await Comment.create({
        content,
        owner: req.user._id,
        video: videoId
    });

    comment = await Comment.findById(comment._id).select("-createdAt -updatedAt").populate('owner', 'userName avatar -_id').lean();

    res.status(HTTP_STATUS_CODES.CREATED.code).json(
        new ApiResponse(
            HTTP_STATUS_CODES.CREATED.code,
            comment,
            "comment added sucessfully"
        )
    )

})

// DONE:  API Testing ✅ (Completed)
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!commentId) {
        throw new ApiError(HTTP_STATUS_CODES.BAD_REQUEST.code, "comment ID is required in params")
    };
    if (!isValidObjectId(commentId)) {
        throw new ApiError(HTTP_STATUS_CODES.BAD_REQUEST.code, "Invalid commentId");
    };

    if (!content || content.trim().length < 1) {
        throw new ApiError(HTTP_STATUS_CODES.BAD_REQUEST.code, "content feild can not be empty");
    };
    if (content.trim().length > 5000) {
        throw new ApiError(HTTP_STATUS_CODES.BAD_REQUEST.code, "content is too long");
    };

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(HTTP_STATUS_CODES.NOT_FOUND.code, "comment not found")
    };
    if (req.user._id.toString() !== comment.owner.toString()) {
        throw new ApiError(HTTP_STATUS_CODES.UNAUTHORIZED.code, "You don't have permission to update this comment");
    }
    comment.content = content;
    const updatedComment = await comment.save();
    const populatedComment = await Comment.findById(updatedComment._id)
        .select("-createdAt -updatedAt")
        .populate("owner", "userName avatar -_id");



    res.status(HTTP_STATUS_CODES.OK.code).json(
        new ApiResponse(
            HTTP_STATUS_CODES.OK.code,
            populatedComment,
            "comment updated successfully"
        )
    )

})

// DONE:  API Testing ✅ (Completed)
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(HTTP_STATUS_CODES.BAD_REQUEST.code, "comment ID is required in params")
    };
    if (!isValidObjectId(commentId)) {
        throw new ApiError(HTTP_STATUS_CODES.BAD_REQUEST.code, "Invalid commentId");
    };

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(HTTP_STATUS_CODES.NOT_FOUND.code, "comment not found")
    };

    if (req.user._id.toString() !== comment.owner.toString()) {
        throw new ApiError(HTTP_STATUS_CODES.UNAUTHORIZED.code, "You dont have permission to delete this comment");
    };
    await comment.deleteOne();

    res.status(HTTP_STATUS_CODES.OK.code).json(
        new ApiResponse(
            HTTP_STATUS_CODES.OK.code,
            {},
            "Comment deleted successfully"
        )
    )


})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
