import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Playlist name is required"],
      maxlength: [120, "Max length is 120 characters"],
    },
    description: {
      type: String,
      required: [true, "Playlist description is required"],
      maxlength: [500, "Max length is 500 characters"],
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Playlist owner is required"],
    },
  },
  { timestamps: true }
);

export const Playlist = mongoose.model("Playlist", playlistSchema);
