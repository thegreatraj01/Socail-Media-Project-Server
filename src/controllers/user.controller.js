import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import mongoose from "mongoose";
import HTTP_STATUS_CODES from "../utils/httpStatusCodes.js";

export const genrateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforesave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR.code,
      "Something went wrong while generating access token and refresh token"
    );
  }
};
// DONE:  API Testing ✅ (Completed)
export const registerUser = asyncHandler(async (req, res) => {
  const { userName, fullName, emailOrMobileNumber, password } = req.body;
  if (
    [userName, fullName, emailOrMobileNumber, password].some(
      (field) => !field || field?.trim() === ""
    )
  ) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "All fields are required"
    );
  }
  let email, mobileNumber;
  if (emailOrMobileNumber.includes("@")) {
    email = emailOrMobileNumber;
    mobileNumber = null;
  } else if (/^\d{10}$/.test(emailOrMobileNumber)) {
    mobileNumber = emailOrMobileNumber;
    email = null;
  } else {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "Invalid email or mobile number"
    );
  }

  const avaterLocalPath = req.files?.avatar && req.files?.avatar[0]?.path;
  if (!avaterLocalPath) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "avatar image is required upload an image"
    );
  }
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (req.files && req.files.coverImage && req.files.coverImage[0]) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  const existedUser = await User.findOne({
    $or: [{ email }, { userName }],
  });
  if (existedUser) {
    fs.unlink(avaterLocalPath, (err) => {
      console.log(err, "error while deleting image");
    });
    coverImageLocalPath &&
      fs.unlink(coverImageLocalPath, (err) => {
        console.log(err, "error while deleting image");
      });
    throw new ApiError(
      HTTP_STATUS_CODES.CONFLICT.code,
      "user with this email or username already exists"
    );
  }

  const avatar = await uploadOnCloudinary(avaterLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : "";
  if (!avatar) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "avater image is required"
    );
  }
  const user = await User.create({
    fullName,
    userName,
    email: email || null,
    mobileNumber: mobileNumber || null,
    password,
    avatar: avatar.secure_url,
    coverImage: coverImage?.secure_url || "",
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -iSmobileNumberVerified -iSemailVerified"
  );
  // TODO: complite this function
  // if (mobileNumber) {
  //     sendOtp(createdUser._id, mobileNumber && mobileNumber);
  // } else if (email) {

  // }

  // return res.status(HTTP_STATUS_CODES.CREATED.code).json(new ApiResponse(HTTP_STATUS_CODES.OK.code, createdUser, `user registered  successfuly ${mobileNumber ? 'otp is send to you Number please vefify It ' : 'otp is send to your email plase verify it '}`));
  return res
    .status(HTTP_STATUS_CODES.CREATED.code)
    .json(
      new ApiResponse(
        HTTP_STATUS_CODES.OK.code,
        createdUser,
        `user registered  successfuly`
      )
    );
});

// DONE:  API Testing ✅ (Completed)
export const loginUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;
  if (!(userName || email)) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "userName or email is required"
    );
  }
  if (!password.trim()) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "password is required"
    );
  }
  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (!user) {
    throw new ApiError(
      HTTP_STATUS_CODES.NOT_FOUND.code,
      "No user found please check username or email"
    );
  }
  const isPasswordValid = user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(
      HTTP_STATUS_CODES.UNAUTHORIZED.code,
      "Invalid User credintial"
    );
  }
  const { refreshToken, accessToken } = await genrateAccessAndRefreshTokens(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(HTTP_STATUS_CODES.OK.code)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        HTTP_STATUS_CODES.OK.code,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

// DONE:  API Testing ✅ (Completed)
export const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: "",
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(HTTP_STATUS_CODES.OK.code)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(
      new ApiResponse(
        HTTP_STATUS_CODES.OK.code,
        {},
        "User logged out successfully"
      )
    );
});

// DONE:  API Testing ✅ (Completed)
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(
      HTTP_STATUS_CODES.UNAUTHORIZED.code,
      "Unauthorized request No token provided"
    );
  }
  try {
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decoded?._id);
    if (!user) {
      throw new ApiError(
        HTTP_STATUS_CODES.UNAUTHORIZED.code,
        "Invalid refresh token"
      );
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(
        HTTP_STATUS_CODES.UNAUTHORIZED.code,
        "refresh token is expired or used"
      );
    }
    const option = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, refreshToken } = await genrateAccessAndRefreshTokens(
      user?._id
    );
    return res
      .status(HTTP_STATUS_CODES.OK.code)
      .cookie("refreshToken", refreshToken, option)
      .cookie("accessToken", accessToken, option)
      .json(
        new ApiResponse(
          HTTP_STATUS_CODES.OK.code,
          { accessToken, refreshToken },
          "token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR.code,
      error?.message || "invalid refresh token"
    );
  }
});

// DONE:  API Testing ✅ (Completed)
export const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword?.trim() || !newPassword?.trim()) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "Old password and new password are required"
    );
  }

  if (oldPassword.trim() === newPassword.trim()) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "Old and new passwords cannot be the same"
    );
  }

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "Invalid old password"
    );
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(HTTP_STATUS_CODES.OK.code)
    .json(
      new ApiResponse(
        HTTP_STATUS_CODES.OK.code,
        {},
        "Password changed successfully"
      )
    );
});

// TODO: create a fuction for change password using otp

// DONE:  API Testing ✅ (Completed)
export const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(HTTP_STATUS_CODES.NOT_FOUND.code, "User not found");
  }
  return res
    .status(HTTP_STATUS_CODES.OK.code)
    .json(
      new ApiResponse(
        HTTP_STATUS_CODES.OK.code,
        req.user,
        "Current user fatched successfully"
      )
    );
});

// DONE:  API Testing ✅ (Completed)
export const updateUserDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "fullName and email are required"
    );
  }

  // TODO: Add Email validation to change email
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(HTTP_STATUS_CODES.OK.code)
    .json(
      new ApiResponse(
        HTTP_STATUS_CODES.OK.code,
        user,
        "user updated successfully"
      )
    );
});

// DONE:  API Testing ✅ (Completed)
export const updateUserAvatar = asyncHandler(async (req, res) => {
  const localFilePath = req.file?.path;
  if (!localFilePath) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "Avatar file is missing"
    );
  }
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(HTTP_STATUS_CODES.NOT_FOUND.code, "User not found");
  }
  const oldAvatar = user.avatar;
  // Delete old avatar from Cloudinary if it exists
  if (oldAvatar) {
    try {
      await deleteFromCloudinary(oldAvatar);
    } catch (error) {
      console.error("Failed to delete old avatar:", error);
    }
  }

  // Upload new avatar
  const avatar = await uploadOnCloudinary(localFilePath);
  // Handle upload failure
  if (!avatar || !avatar.secure_url) {
    throw new ApiError(
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR.code,
      "Error while uploading avatar"
    );
  }
  // Update user's avatar field
  user.avatar = avatar.secure_url;
  await user.save();
  const updatedUser = user.toObject();
  delete updatedUser.password;
  delete updatedUser.refreshToken;

  return res
    .status(HTTP_STATUS_CODES.OK.code)
    .json(
      new ApiResponse(
        HTTP_STATUS_CODES.OK.code,
        updatedUser,
        "Avatar updated successfully"
      )
    );
});

// DONE:  API Testing ✅ (Completed)
export const updateUserCoverImage = asyncHandler(async (req, res) => {
  const locaFilePtah = req.file?.path;
  if (!locaFilePtah) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "coverImage file is missing"
    );
  }

  const user = await User.findById(req.user._id);
  const oldCoverImage = user.coverImage;

  if (oldCoverImage) {
    try {
      await deleteFromCloudinary(oldCoverImage);
    } catch (error) {
      console.error("Failed to delete old CoverImage:", error);
    }
  }

  const coverImage = await uploadOnCloudinary(locaFilePtah);
  if (!coverImage || !coverImage.secure_url) {
    throw new ApiError(
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR.code,
      "Error while uploading avatar"
    );
  }
  user.coverImage = coverImage.secure_url;
  await user.save();

  const updatedUser = user.toObject();
  delete updatedUser.password;
  delete updatedUser.refreshToken;

  return res
    .status(HTTP_STATUS_CODES.OK.code)
    .json(
      new ApiResponse(
        HTTP_STATUS_CODES.OK.code,
        updatedUser,
        "coverImage updated successfully"
      )
    );
});

export const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { userName } = req.params;
  if (!userName) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "UserName is missing"
    );
  }
  const channel = await User.aggregate([
    {
      $match: {
        userName: userName?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers", // how many subscribers you have
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo", // how many channel you have subscribed
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        userName: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1, // how many subscribers you have
        channelSubscribedToCount: 1, // how many channels you have subscribed
        isSubscribed: 1, // current user(who created the req ) is subscribed you or not
      },
    },
  ]);
  // console.log(channel);
  if (!channel?.length) {
    throw new Error("Channel does not exist");
  }
  return res
    .status(HTTP_STATUS_CODES.OK.code)
    .json(
      new ApiResponse(
        HTTP_STATUS_CODES.OK.code,
        channel[0],
        "user Channel fetched successfully"
      )
    );
});

export const getUserWatchHistory = asyncHandler(async (req, res) => {
  // const userId = new mongoose.Types.ObjectId(req.user._id);
  const userId = mongoose.Types.ObjectId.createFromHexString(
    req.user._id.toString()
  );

  const user = await User.aggregate([
    { $match: { _id: userId } },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    userName: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: { $first: "$owner" }, // fixed typo here
            },
          },
        ],
      },
    },
  ]);

  if (!user || !user.length) {
    return res
      .status(HTTP_STATUS_CODES.NOT_FOUND.code)
      .json(
        new ApiResponse(
          HTTP_STATUS_CODES.NOT_FOUND.code,
          [],
          "User or watch history not found"
        )
      );
  }

  return res
    .status(HTTP_STATUS_CODES.OK.code)
    .json(
      new ApiResponse(
        HTTP_STATUS_CODES.OK.code,
        user[0].watchHistory,
        "Watch History fetched successfully"
      )
    );
});
