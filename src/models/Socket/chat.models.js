import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "ChatMessage",
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// ✅ Custom validator to enforce participant count
chatSchema.pre("validate", function (next) {
  if (!this.isGroupChat && this.participants.length !== 2) {
    return next(new Error("One-to-one chat must have exactly 2 participants"));
  }

  if (this.isGroupChat && this.participants.length < 3) {
    return next(new Error("Group chat must have at least 3 participants"));
  }

  next();
});

export const Chat = mongoose.model("Chat", chatSchema);
