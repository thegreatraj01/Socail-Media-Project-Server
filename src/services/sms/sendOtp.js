import twilio from "twilio";
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_MOBILE_NUMBER;
import OTP from "../../models/otp.model.js";
const client = new twilio(accountSid, authToken);

// client.messages
//     .create({
//         body: 'You have an appointment with Owl, Inc. on Friday, November 3 at 4:00 PM. Reply C to confirm.',
//         messagingServiceSid: 'MGXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
//         to: '+15558675310'
//     })
//     .then(message => console.log(message.sid));

const sendOtp = async (userId, mobileNumber) => {
  const otp = await OTP.generateAndSaveOTP(userId);
  try {
    const message = await client.messages.create({
      from,
      to: `+91${mobileNumber}`,
      body: `Your Otp to verify your Number is ${otp.otp} 
                valid for 10 minute `,
    });
    // console.log(message);
    return otp;
  } catch (error) {
    console.log(error);
    return "error genrating otp for mobile verificaiton";
  }
};

export default sendOtp;
