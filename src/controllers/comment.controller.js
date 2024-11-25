import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content} = req.body;
    const {videoId} = req.params;

        if(!content) throw new ApiError(400, "comment are not found")

            const createComment = await Comment.create({
                content,
                video: videoId,
                owner: req.user._id
            })

        if(!createComment) throw new ApiError(500, "can't add comment to this video")

            return res
            .status(200)
            .json(new ApiResponse(200, createComment, "comment add successfully"))
    
})

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    const videoComments = await Comment.aggregate([
        {
          $match: {
            video: new mongoose.Types.ObjectId(videoId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "commentOwner",
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
                  foreignField: "comment",
                  as: "commentLikes",
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
                        as: "commentLikedByUsers",
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
                  commentLikesCount: {
                    $size: "$commentLikes",
                  },
                  hasUserLikedComment: {
                    $cond: {
                      if: { $in: [req.user?._id, "$commentLikes.likedBy"] },
                      then: true,
                      else: false,
                    },
                  },
                },
              },
        {
          $skip: (page - 1) * limit,
        },
        {
          $limit: parseInt(limit),
        },
      ]);
    
      if (!videoComments) throw new ApiError(400, "Could not find video comments");
    
      return res
        .status(200)
        .json(
          new ApiResponse(200, videoComments, "Video comments fetched successfully")
        );
    });

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
      const {commentId} = req.params;
      const {content} = req.body;

      if(!content) throw new ApiError(400, "content are not found please Chech!")
      if(!commentId) throw new ApiError(400, "invalid link chech again")

      const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
              content: content
            }
        },
        {
          new: true
        }
    )

    if(!updatedComment) throw new ApiError(500, "internal server erroe can't update your comment")

      return res
      .status(200)
      .json(new ApiResponse(200, updatedComment, "comment updated successfully"))

    })

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params

    if(!commentId) throw new ApiError(400, "invalid link Check again!")

      const deletedComment = await Comment.findByIdAndDelete(commentId) 

      if(!deletedComment) throw new ApiError(500, "delated unfailed can't delete comment")

      return res
      .status(200)
      .json(new ApiResponse(200, deletedComment, "comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }