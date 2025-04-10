import { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import HTTP_STATUS_CODES from "../utils/httpStatusCodes.js";

// DONE TESTED
const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "Name and description are required"
    );
  }

  if (name.trim().length > 120) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "Name exceeded 120 character limit"
    );
  }

  if (description.trim().length > 500) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "Description exceeded 500 character limit"
    );
  }

  const playlist = await Playlist.create({
    name: name.trim(),
    description: description.trim(),
    owner: req.user._id,
  });

  res
    .status(HTTP_STATUS_CODES.CREATED.code)
    .json(
      new ApiResponse(
        HTTP_STATUS_CODES.CREATED.code,
        playlist,
        "Playlist created successfully"
      )
    );
});

//DONE: TESTED
const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "User ID is not valid"
    );
  }

  const userPlaylists = await Playlist.find({ owner: userId })
    .populate("videos", "title thumbnail")
    .lean();

  res
    .status(HTTP_STATUS_CODES.OK.code)
    .json(
      new ApiResponse(
        HTTP_STATUS_CODES.OK.code,
        userPlaylists,
        "Playlists fetched successfully"
      )
    );
});

//DONE: TESTED
const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "Playlist ID is not valid"
    );
  }

  const playlist = await Playlist.findById(playlistId)
    .populate("videos", "title thumbnail")
    .lean();

  if (!playlist) {
    throw new ApiError(HTTP_STATUS_CODES.NOT_FOUND.code, "Playlist not found");
  }

  res
    .status(HTTP_STATUS_CODES.OK.code)
    .json(
      new ApiResponse(
        HTTP_STATUS_CODES.OK.code,
        playlist,
        "Playlist fetched successfully"
      )
    );
});

//DONE: TESTED
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "Invalid Playlist ID or Video ID"
    );
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(HTTP_STATUS_CODES.NOT_FOUND.code, "Playlist not found");
  }

  // Check if video already exists in the playlist
  if (playlist.videos.includes(videoId)) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "Video is already in the playlist"
    );
  }

  playlist.videos.push(videoId);
  await playlist.save();

  const updatedPlaylist = await Playlist.findById(playlistId)
    .populate("videos", "title thumbnail")
    .lean();

  res
    .status(HTTP_STATUS_CODES.OK.code)
    .json(
      new ApiResponse(
        HTTP_STATUS_CODES.OK.code,
        updatedPlaylist,
        "Video added to playlist successfully"
      )
    );
});

// DONE: TESTED
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "Invalid Playlist ID or Video ID"
    );
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(HTTP_STATUS_CODES.NOT_FOUND.code, "Playlist not found");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      HTTP_STATUS_CODES.UNAUTHORIZED.code,
      "You don't have permission to modify this playlist"
    );
  }
  if (!playlist.videos.includes(videoId)) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "Video is not available in playlist"
    );
  }

  playlist.videos.pull(videoId);

  await playlist.save();

  const updatedPlaylist = await Playlist.findById(playlistId)
    .populate("videos", "thumbnail title")
    .lean();

  res
    .status(HTTP_STATUS_CODES.OK.code)
    .json(
      new ApiResponse(
        HTTP_STATUS_CODES.OK.code,
        updatedPlaylist,
        "Video removed from playlist successfully"
      )
    );
});

//DONE: TESTED
const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "Invalid playlist ID"
    );
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(HTTP_STATUS_CODES.NOT_FOUND.code, "Playlist not found");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      HTTP_STATUS_CODES.UNAUTHORIZED.code,
      "You do not have permission to delete this playlist"
    );
  }

  await playlist.deleteOne();

  res
    .status(HTTP_STATUS_CODES.OK.code)
    .json(
      new ApiResponse(
        HTTP_STATUS_CODES.OK.code,
        {},
        "Playlist deleted successfully"
      )
    );
});

//DONE: TESTED
const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "Playlist ID is not valid"
    );
  }

  if (!name?.trim() || !description?.trim()) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "Name or description is empty"
    );
  }

  if (name.trim().length > 120) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "Name exceeded 120 character limit"
    );
  }

  if (description.trim().length > 500) {
    throw new ApiError(
      HTTP_STATUS_CODES.BAD_REQUEST.code,
      "Description exceeded 500 character limit"
    );
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name: name.trim(),
        description: description.trim(),
      },
    },
    { new: true }
  )
    .populate("videos", "title thumbnail")
    .lean();

  if (!updatedPlaylist) {
    throw new ApiError(HTTP_STATUS_CODES.NOT_FOUND.code, "Playlist not found");
  }

  res
    .status(HTTP_STATUS_CODES.OK.code)
    .json(
      new ApiResponse(
        HTTP_STATUS_CODES.OK.code,
        updatedPlaylist,
        "Playlist updated successfully"
      )
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
