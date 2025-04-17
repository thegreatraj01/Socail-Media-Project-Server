import mongoose, { Schema } from "mongoose";
// TODO: Add image and pdf file sharing in the next version

const chatMessageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    attachments: {
      type: [
        {
          url: String,
          localPath: String,
        },
      ],
      default: [],
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
    isModified: {
      type: Boolean,
      default: false,
    },
    modifiedAt: {
      type: Date,
    },

    // ✅ Soft delete for all users
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Automatically set modified info when content changes
chatMessageSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    this.isModified = true;
    this.modifiedAt = new Date();
  }
  next();
});

export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
