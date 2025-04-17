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
    expires: 600, // Automatically delete after 10 minutes
  },
});

const OTP = model("OTP", OTPSchema);

OTP.generateAndSaveOTP = async (userId) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await OTP.deleteMany({ user: userId });

  const newOTP = new OTP({
    otp,
    user: userId,
  });

  try {
    const savedOtp = await newOTP.save();
    return savedOtp;
  } catch (error) {
    console.error('❌ Error saving OTP:', error);
    return null;
  }
};

export default OTP;
