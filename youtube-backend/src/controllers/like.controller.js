import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"
import { Tweet } from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  let message;
  //TODO: toggle like on video

  if (!videoId) throw new ApiError(400, "invalid link chech Again!")

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

    message = "video unliked successfully"
  } else {
    const likeToVideo = await Like.create({
      likedBy: req.user._id,
      video: new mongoose.Types.ObjectId(videoId),
    })
    if (!likeToVideo) throw new ApiError(500, "failed to like on video ")

    message = "video liked successfully"
  }

  return res
    .status(200)
    .json(new ApiResponse(200, fetchedVideo, message))


})

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params
  //TODO: toggle like on comment
  let message;
  if (!commentId) throw new ApiError(400, "invalid link chech Again!")

  const fetchedComment = await Comment.findById(commentId);
  if (!fetchedComment) throw new ApiError(404, "comment not found");

  const isCommentLikeTo = await Like.findOne(
    {
      likedBy: req.user._id,
      comment: new mongoose.Types.ObjectId(commentId),
    },
    {
      new: true,
    }
  );
  if (isCommentLikeTo) {
    await Like.findByIdAndDelete(isCommentLikeTo._id);

    message = "comment unliked successfully"
  } else {
    const likeOnComment = await Like.create({
      likedBy: req.user._id,
      comment: new mongoose.Types.ObjectId(commentId),
    })
    if (!likeOnComment) throw new ApiError(500, "failed to like on comment ")

    message = "comment liked successfully"
  }

  return res
    .status(200)
    .json(new ApiResponse(200, fetchedComment, message))


})

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params
  //TODO: toggle like on tweet

  let message;
  if (!tweetId) throw new ApiError(400, "invalid link chech Again!")

  const fetchedTweet = await Tweet.findById(tweetId);
  if (!fetchedTweet) throw new ApiError(404, "comment not found");

  const isTweetLikeTo = await Like.findOne(
    {
      likedBy: req.user._id,
      tweet: new mongoose.Types.ObjectId(tweetId),
    },
    {
      new: true,
    }
  );
  if (isTweetLikeTo) {
    await Like.findByIdAndDelete(isTweetLikeTo._id);

    message = "Tweet unliked successfully"
  } else {
    const likeOnTweet = await Like.create({
      likedBy: req.user._id,
      tweet: new mongoose.Types.ObjectId(tweetId),
    })
    if (!likeOnTweet) throw new ApiError(500, "failed to like on comment ")

    message = "Tweet liked successfully"
  }

  return res
    .status(200)
    .json(new ApiResponse(200, fetchedTweet, message))
}
)
const getLikedVideos = asyncHandler(async (req, res) => {
  // Check if user exists
  const user = req.user._id;
  if (!user) {
      throw new ApiError(400, "User not found");
  }

  // Fetch liked videos using aggregation
  const allLikedVideos = await Like.aggregate([
      {
          $match: {
              likedBy: new mongoose.Types.ObjectId(user), // Match videos liked by the user
              video: { $ne: null }, // Exclude null videos
          },
      },
      {
          $lookup: {
              from: "videos",
              localField: "video",
              foreignField: "_id",
              as: "allLikedVideos",
              pipeline: [
                  {
                      $project: {
                          // Include only necessary fields, excluding createdAt and updatedAt
                          videoFile: 1,
                          thumbnail: 1,
                          title: 1,
                          description: 1,
                          duration: 1,
                          views: 1,
                          owner: 1
                      },
                  },
                  {
                      $lookup: {
                          from: "users",
                          localField: "owner",
                          foreignField: "_id",
                          as: "VideoOwner",
                          pipeline: [
                              {
                                  $project: {
                                      // Include only necessary user fields
                                      fullName: 1,
                                      username: 1,
                                      avatar: 1,
                                  },
                              },
                          ],
                      },
                  },
              ],
          },
      },
      {
          $addFields: {
              allLikedVideocount: {
                  $size: "$allLikedVideos", // Add a count of liked videos
              },
          },
      },
  ]);

  // Handle errors or success
  if (!allLikedVideos) {
      throw new ApiError(500, "Internal server error, can't fetch liked videos");
  }

  return res
      .status(200)
      .json(new ApiResponse(200, allLikedVideos, "Fetched all liked videos successfully"));
});

export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos
}