import mongoose, { isValidObjectId } from "mongoose";
import User from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import HTTP_STATUS_CODES from "../utils/httpStatusCodes.js";

// TODO: test it  Create multiple user then test it
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const subscriberId = req.user._id;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "Invalid channel ID"
    );
  }

  if (channelId === String(subscriberId)) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "Users cannot subscribe to themselves"
    );
  }

  const existingSubscription = await Subscription.findOne({
    subscriber: subscriberId,
    channel: channelId,
  });

  if (existingSubscription) {
    await existingSubscription.deleteOne();
    return res
      .status(HTTP_STATUS_CODES.OK.code)
      .json(
        new ApiResponse(
          HTTP_STATUS_CODES.OK.code,
          {},
          "Unsubscribed from channel"
        )
      );
  }

  const subscription = await Subscription.create({
    subscriber: subscriberId,
    channel: channelId,
  });

  res
    .status(HTTP_STATUS_CODES.CREATED.code)
    .json(
      new ApiResponse(
        HTTP_STATUS_CODES.CREATED.code,
        subscription,
        "Subscribed to channel"
      )
    );
});

//TODO: test it controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "Invalid channel ID"
    );
  }

  const subscribers = await Subscription.find({ channel: channelId })
    .populate("subscriber", "username avatar")
    .sort({ createdAt: -1 })
    .lean();

  res
    .status(HTTP_STATUS_CODES.OK.code)
    .json(
      new ApiResponse(
        HTTP_STATUS_CODES.OK.code,
        subscribers,
        "Subscribers fetched"
      )
    );
});

//TODO: test it controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const subscriberId = req.user._id;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "Invalid subscriber ID"
    );
  }

  const channels = await Subscription.find({ subscriber: subscriberId })
    .populate("channel", "username avatar")
    .sort({ createdAt: -1 });

  res
    .status(HTTP_STATUS_CODES.OK.code)
    .json(
      new ApiResponse(
        HTTP_STATUS_CODES.OK.code,
        channels,
        "Subscribed channels fetched"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
