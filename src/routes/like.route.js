import { Router } from "express";
import {toggleVideoLike} from '../controllers/like.controller.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/likedOnvideo/:videoId").get(verifyJWT, toggleVideoLike)



export default router   