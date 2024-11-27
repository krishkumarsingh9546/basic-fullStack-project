import { Router } from "express";
import {createTweet, getUserTweets, updateTweet, deleteTweet} from "../controllers/tweet.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/createTweet").post(verifyJWT, createTweet)
router.route("/userTweet").get(verifyJWT, getUserTweets)
router.route("/updateTweet/:tweetId").patch(verifyJWT, updateTweet)
router.route("/deleteTweet/:tweetId").patch(verifyJWT, deleteTweet)


export default router