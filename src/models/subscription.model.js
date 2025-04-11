import { Schema, model } from "mongoose";

const subscriptionSchema = new Schema(
  {
    // The user who is subscribing to another user (the follower)
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // The user who is being subscribed to (the channel or followed user)
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate subscriptions from the same subscriber to the same channel
subscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true });

// Prevent a user from subscribing to themselves
subscriptionSchema.pre("save", function (next) {
  if (this.subscriber.equals(this.channel)) {
    return next(new Error("Users cannot subscribe to themselves."));
  }
  next();
});

export const Subscription = model("Subscription", subscriptionSchema);
