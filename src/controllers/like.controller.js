import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import HTTP_STATUS_CODE from "../utils/httpStatusCodes.js";

// ✅ Video Like DONE TESTED
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(HTTP_STATUS_CODE.BAD_REQUEST.code, "Invalid video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(HTTP_STATUS_CODE.NOT_FOUND.code, "Video not found");
  }

  const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

  if (existingLike) {
    await existingLike.deleteOne();
    return res
      .status(HTTP_STATUS_CODE.OK.code)
      .json(new ApiResponse(HTTP_STATUS_CODE.OK.code, {}, "Video unliked"));
  }

  const like = await Like.create({ video: videoId, likedBy: userId });

  res
    .status(HTTP_STATUS_CODE.CREATED.code)
    .json(new ApiResponse(HTTP_STATUS_CODE.CREATED.code, like, "Video liked"));
});

// ✅ Comment Like DONE TESTED
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(HTTP_STATUS_CODE.BAD_REQUEST.code, "Invalid comment ID");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(HTTP_STATUS_CODE.NOT_FOUND.code, "Comment not found");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });

  if (existingLike) {
    await existingLike.deleteOne();
    return res
      .status(HTTP_STATUS_CODE.OK.code)
      .json(new ApiResponse(HTTP_STATUS_CODE.OK.code, {}, "Comment unliked"));
  }

  const like = await Like.create({ comment: commentId, likedBy: userId });

  res
    .status(HTTP_STATUS_CODE.CREATED.code)
    .json(
      new ApiResponse(HTTP_STATUS_CODE.CREATED.code, like, "Comment liked")
    );
});

// ✅ Tweet Like DONE TESTED
const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(HTTP_STATUS_CODE.BAD_REQUEST.code, "Invalid tweet ID");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(HTTP_STATUS_CODE.NOT_FOUND.code, "Tweet not found");
  }

  const existingLike = await Like.findOne({ tweet: tweetId, likedBy: userId });

  if (existingLike) {
    await existingLike.deleteOne();
    return res
      .status(HTTP_STATUS_CODE.OK.code)
      .json(new ApiResponse(HTTP_STATUS_CODE.OK.code, {}, "Tweet unliked"));
  }

  const like = await Like.create({ tweet: tweetId, likedBy: userId });

  res
    .status(HTTP_STATUS_CODE.CREATED.code)
    .json(new ApiResponse(HTTP_STATUS_CODE.CREATED.code, like, "Tweet liked"));
});

// ✅ Get All Liked Videos  DONE TESTED
const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const likedVideos = (
    await Like.find({ likedBy: userId, video: { $ne: null } })
      .select("-createdAt -updatedAt -likedBy")
      .populate("video", "thumbnail videoFile -_id")
      .sort({ createdAt: -1 })
      .lean()
  ).filter((item) => item.video !== null);

  res
    .status(HTTP_STATUS_CODE.OK.code)
    .json(
      new ApiResponse(
        HTTP_STATUS_CODE.OK.code,
        likedVideos,
        "Liked videos fetched"
      )
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
