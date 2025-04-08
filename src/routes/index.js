import { Router } from "express";
const router = Router();
import userRouter from './user.routes.js';
import videoRouter from './video.routes.js'
import commentRouter from './comment.routes.js'

router.use("/users" , userRouter);
router.use("/video" , videoRouter);
router.use("/comment",commentRouter);


export default router ;