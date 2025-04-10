import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Custom validator to allow only one target (video, comment, or tweet)
likeSchema.pre("validate", function (next) {
  const targets = [this.video, this.comment, this.tweet];
  const definedTargets = targets.filter(
    (target) => target !== undefined && target !== null
  );

  if (definedTargets.length !== 1) {
    return next(
      new Error("Like must reference exactly one of: video, comment, or tweet.")
    );
  }

  next();
});

export const Like = mongoose.model("Like", likeSchema);
