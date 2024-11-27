import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body
    const owner = req.user._id
    if(!content){
        throw new ApiError(400, "please create a tweet message")
    }

    // console.log(content)

    const tweet = await Tweet.create({
        content,
        owner
    })

    const createTweet = await Tweet.findById(tweet._id)

    if(!createTweet){
        throw new ApiError(400, "tweet is not create")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(200, createTweet, "tweet created successfully")
    )


})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
     const userTweets = await Tweet.aggregate([
        {
            $match: {
                owner: req.user._id
            },
        },
        {
            $lookup: {
                from: "likes",
                localField:"_id",
                foreignField: "tweet",
                as:"tweetLikes"
            }

        },
        {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "TweetOwner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "tweet",
              as: "TweetLikes",
              pipeline: [
                {
                  $project: {
                    likedBy: 1,
                  },
                },
                {
                  $lookup: {
                    from: "users",
                    localField: "likedBy",
                    foreignField: "_id",
                    as: "TweetLikedByUsers",
                    pipeline: [
                      {
                        $project: {
                          fullname: 1,
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
                tweetLikes:{
                    $size: "$tweetLikes"
                },
                hasUserLikedTweet: {
                    $cond: {
                      if: { $in: [req.user?._id, "$TweetLikes.likedBy"] },
                      then: true,
                      else: false,
                    },
                  },
            }
           
        }
        
     ])
    
     return res
     .status(200)
     .json(new ApiResponse(200, userTweets, "User tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {content} = req.body
    const {tweetId} = req.body

    if(!tweetId){
        throw new ApiError(400, "tweet id not found")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
               content
            }
        },{new: true})


    if(!updatedTweet) throw new ApiError(400, "not update tweet message");
    

    return res 
   .status(200)
   .json(new ApiResponse(200, updatedTweet, "tweet message is updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} =  req.params

    if(!tweetId) throw new ApiError(400, "tweetId not find please check!");

    const deletedTweet = await Tweet.findByIdAndDelete( 
            tweetId
       )


    if(!deletedTweet) throw new ApiError(400, "please check not delete tweet");
    

    return res 
   .status(200)
   .json(new ApiResponse(200, deletedTweet, "deletdTweet successfully"))
    
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}