import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import HTTP_STATUS_CODES from "../utils/httpStatusCodes.js";

// TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
const getChannelStats = asyncHandler(async (req, res) => {
  const userId = mongoose.Types.ObjectId.createFromHexString(
    req.user._id.toString()
  );

  let totalVideos = 0;
  let totalViews = 0;
  let totalLikes = 0;
  let videoIds = [];
  let message = "";

  // Step 1: Aggregate video stats
  const videoStats = await Video.aggregate([
    {
      $match: { owner: userId },
    },
    {
      $group: {
        _id: null,
        totalVideos: { $sum: 1 },
        totalViews: { $sum: "$views" },
        videosIds: { $push: "$_id" },
      },
    },
  ]);

  if (videoStats.length > 0) {
    videoIds = videoStats[0].videosIds;
    totalVideos = videoStats[0].totalVideos;
    totalViews = videoStats[0].totalViews;
  } else {
    message += "No videos found. ";
  }

  // Step 2: Aggregate likes count if there are videos
  if (videoIds.length > 0) {
    const likesCount = await Like.aggregate([
      {
        $match: {
          video: { $in: videoIds },
        },
      },
      {
        $group: {
          _id: null,
          totalLikes: { $sum: 1 },
        },
      },
    ]);

    totalLikes = likesCount[0]?.totalLikes || 0;
  }

  // Step 3: Count subscribers
  const totalSubscribers = await Subscription.countDocuments({
    channel: userId,
  });
  if (totalSubscribers === 0) {
    message += "No subscribers found. ";
  }

  // Step 4: Final stats object
  const stats = {
    totalVideos,
    totalViews,
    totalLikes,
    totalSubscribers,
  };

  // Default message if nothing missing
  message += "Channel stats fetched successfully.";

  return res
    .status(HTTP_STATUS_CODES.OK.code)
    .json(new ApiResponse(HTTP_STATUS_CODES.OK.code, stats, message.trim()));
});

// DONE: TESTED ✅     Get all the videos uploaded by the channel
const getChannelVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const uploadedVideos = await Video.find({ owner: userId })
    .sort({ createdAt: -1 })
    .select("thumbnail videoFile title")
    .lean();

  if (!uploadedVideos.length) {
    throw new ApiError(
      HTTP_STATUS_CODES.NOT_FOUND.code,
      "No videos found uploaded by user"
    );
  }

  res
    .status(HTTP_STATUS_CODES.OK.code)
    .json(
      new ApiResponse(
        HTTP_STATUS_CODES.OK.code,
        uploadedVideos,
        "Uploaded video feached successfully"
      )
    );
});

export { getChannelStats, getChannelVideos };
