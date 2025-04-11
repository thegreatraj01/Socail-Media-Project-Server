import { Router } from "express";
const router = Router();
import userRouter from "./user.routes.js";
import videoRouter from "./video.routes.js";
import commentRouter from "./comment.routes.js";
import tweetRouter from "./tweet.routes.js";
import healtCheckRouter from "./healthcheck.routes.js";
import playlistRouter from "./playlist.routes.js";
import likeRouter from "./like.routes.js";
import subscriptionRouter from "./subscription.routes.js";
import dashboardRouter from "./dashboard.routes.js";

router.use("/users", userRouter);
router.use("/video", videoRouter);
router.use("/comment", commentRouter);
router.use("/tweet", tweetRouter);
router.use("/healthcheck", healtCheckRouter);
router.use("/playlist", playlistRouter);
router.use("/like", likeRouter);
router.use("/subs", subscriptionRouter);
router.use("/dash", dashboardRouter);

export default router;
