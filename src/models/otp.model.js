import { Schema, model } from "mongoose";

const OTPSchema = new Schema({
  otp: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // 600 seconds = 10 minutes
  },
});

// 'expires: 600' sets the TTL to 10 minutes (600 seconds)
// MongoDB will automatically delete the document 10 minutes after the 'createdAt' time.

const OTP = model("OTP", OTPSchema);

OTP.generateAndSaveOTP = async (userId) => {
  // Generate a six-digit random OTP
  const otp = Math.floor(100000 + Math.random() * 900000);

  // Create a new OTP document
  const newOTP = new OTP({
    otp: otp.toString(),
    user: userId,
  });

  // Save the OTP document
  try {
    const otp = await newOTP.save();
    return otp;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default OTP;
