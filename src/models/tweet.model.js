import mongoose, { Schema } from "mongoose";

const tweetSchema = new Schema({
    content: {
        type: String,
        required: true,
        maxlength: [380, 'Content cannot exceed 5000 characters']

    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true })


export const Tweet = mongoose.model("Tweet", tweetSchema);