import { Router } from "express";
import {toggleCommentLike, toggleTweetLike, toggleVideoLike,getLikedVideos} from '../controllers/like.controller.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/likedOnvideo/:videoId").get(verifyJWT, toggleVideoLike)
router.route("/likedOnComment/:commentId").get(verifyJWT, toggleCommentLike)
router.route("/likedOnTweet/:tweetId").get(verifyJWT, toggleTweetLike) 
router.route("/allLikedVideos").get(verifyJWT, getLikedVideos) 


export default router   