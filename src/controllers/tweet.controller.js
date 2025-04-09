import mongoose, { isValidObjectId } from "mongoose";
import User from "../models/user.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import HTTP_STATUS_CODES from "../utils/httpStatusCodes.js";

// DONE:  API Testing ✅ (Completed)
const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const trimedContent = content?.trim();

  if (!trimedContent) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "Content should not be empty"
    );
  }
  if (trimedContent.length > 380) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "Content length exceeds 380 characters"
    );
  }

  const newTweet = await Tweet.create({
    owner: req.user._id,
    content: trimedContent,
  });

  res
    .status(HTTP_STATUS_CODES.CREATED.code)
    .json(
      new ApiResponse(
        HTTP_STATUS_CODES.CREATED.code,
        newTweet,
        "Tweet created successfully"
      )
    );
});

// DONE:  API Testing ✅ (Completed)
const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "Not a valid userId"
    );
  }

  const allTweet = await Tweet.find({
    owner: userId,
  })
    .populate("owner", "userName avatar")
    .sort({ createdAt: -1 })
    .lean();

  res
    .status(HTTP_STATUS_CODES.OK.code)
    .json(
      new ApiResponse(
        HTTP_STATUS_CODES.OK.code,
        allTweet,
        "All tweet fetched successfully"
      )
    );
});

// DONE:  API Testing ✅ (Completed)
const updateTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { tweetId } = req.params;
  const trimedContent = content?.trim();

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "Not a valid tweetId"
    );
  }

  if (!trimedContent) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "Content should not be empty"
    );
  }
  if (trimedContent > 380) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "Content length exceeds 380 characters"
    );
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(HTTP_STATUS_CODES.NOT_FOUND.code, "Tweet not found");
  }
  if (tweet.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      HTTP_STATUS_CODES.FORBIDDEN.code,
      "You are not allowed to edit this tweet"
    );
  }
  tweet.content = trimedContent;
  const modifiedTweet = await tweet.save();

  res
    .status(HTTP_STATUS_CODES.OK.code)
    .json(
      new ApiResponse(
        HTTP_STATUS_CODES.OK.code,
        modifiedTweet,
        "Tweet modified successfully"
      )
    );
});

//TODO: delete tweet
const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "Not a valid tweetId"
    );
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(HTTP_STATUS_CODES.NOT_FOUND.code, "Tweet not found");
  }

  if (tweet.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      HTTP_STATUS_CODES.UNAUTHORIZED.code,
      "You are not authorized to delete this tweet"
    );
  }

  await tweet.deleteOne();

  res
    .status(HTTP_STATUS_CODES.OK.code)
    .json(
      new ApiResponse(
        HTTP_STATUS_CODES.OK.code,
        {},
        "Tweet deleted successfully"
      )
    );
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
