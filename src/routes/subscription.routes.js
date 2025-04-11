import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
  .route("/c/:channelId")
  .get(getSubscribedChannels) // all channel subscribed by current user
  .post(toggleSubscription); // subscribe and unsubcribe

router.route("/getallsubscriber").get(getUserChannelSubscribers); // user channel all subscriber

export default router;
