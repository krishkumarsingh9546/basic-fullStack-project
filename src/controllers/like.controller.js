import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    let message;
    //TODO: toggle like on video

    if(!videoId) throw new ApiError(400, "invalid link chech Again!")

        const fetchedVideo = await Video.findById(videoId);
        if (!fetchedVideo) throw new ApiError(404, "Channel not found");
      
        const isVideoLikeTo = await Like.findOne(
          {
            likedBy: req.user._id,
            video: new mongoose.Types.ObjectId(videoId),
          },
          {
            new: true,
          }
        );
        if (isVideoLikeTo) {
         await Like.findByIdAndDelete(isVideoLikeTo._id);

         message= "video unliked successfully"
        } else {
          const likeToVideo = await Like.create({
            likedBy: req.user._id,
            video: new mongoose.Types.ObjectId(videoId),
          })
          if(!likeToVideo) throw new ApiError(500, "failed to like on video ")

            message= "video liked successfully"
        }

    return res
    .status(200)
    .json(new ApiResponse(200, fetchedVideo, message))


})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}