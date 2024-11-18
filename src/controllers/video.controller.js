import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteOnCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"
import { application } from "express"


const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = -1, userId } = req.query;
  
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const pipeline = [];

  // Search Query
  if (query) {
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      },
    });
  }

  // Filter by userId (owner)
  if (userId) {
    pipeline.push({
      $match: {
        owner: userId,
      },
    });
  }

  // Sorting
  if (sortBy) {
    pipeline.push({
      $sort: {
        [sortBy]: parseInt(sortType) || -1, // Default to descending
      },
    });
  }

  // Pagination
  pipeline.push(
    { $skip: (options.page - 1) * options.limit },
    { $limit: options.limit }
  );

  // Execute Aggregation
  const videoList = await Video.aggregate(pipeline);

  if (!videoList) throw new ApiError(400, "Could not fetch videos");

  // Pagination Metadata
  const totalVideos = await Video.countDocuments({});
  const totalPages = Math.ceil(totalVideos / options.limit);

  return res.status(200).json(new ApiResponse(200, {
    videos: videoList,
    pagination: {
      totalItems: totalVideos,
      totalPages,
      currentPage: options.page,
    },
  }, "Videos fetched successfully"));
      });


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    
    // TODO: get video, upload to cloudinary, create video
    const initialViews = 0;
    if(title == "" || description == "") throw new ApiError(400, "tittle and description are required")

     const videoLocalPath = req.files?.videoFile[0]?.path;
     const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
     

    if(!(videoLocalPath && thumbnailLocalPath)) throw new ApiError(400, "video and thumbnail path not find");

    const video = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath) 
    
    if(!video){
      throw new ApiError(400, "videofiles is required")
    }

    if(!thumbnail){
      throw new ApiError(400, "thumbnailFiles is required")
    }

    const videoCreated = await Video.create({
      videoFile: video.url,
      thumbnail: thumbnail.url,
      title,
      description,
      duration: video.duration,
      views: initialViews,
      owner: req.user._id,
      isPublished: true
    })

    if(!videoCreated){
        throw new ApiError(400, "video is not created")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, videoCreated, "Videos published sucessfully"));

})

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params
  //TODO: get video by id

 if (!videoId) throw new ApiError (400 , "videoId is required");

 const fetchedVideo = await Video.aggregate([
  {
    //find the video on the database
    $match: {
      _id: new mongoose.Types.ObjectId(videoId),
    },
  },

  // //get owner details
  {
    $lookup: {
      from: "users",
      localField: "owner",
      foreignField: "_id",
      as: "videoOwner",
      pipeline: [
        {
          //display username, fullname and avatar of the owner only
          $project: {
            username: 1,
            fullName: 1,
            avatar: 1,
          },
        },
      ],
    },
  },

  //get a list of likes on the video
  {
    $lookup: {
      from: "likes", //you are in "video" and want to get data from "likes"
      localField: "_id",
      foreignField: "video",
      as: "videoLikes",
    },
  },

  // //get a list of comments on the video
  {
    $lookup: {
      from: "comments", //you are in video and want to get from comments
      localField: "_id",
      foreignField: "video",
      as: "videoComments",
    },
  },

  // //add video likes and comments count and if you have liked the video
  {
    $addFields: {
      videoLikesCount: {
        $size: "$videoLikes",
      },
      videoCommentsCount: {
        $size: "$videoComments",
      },
      isLiked: {
        $cond: {
          if: { $in: [req.user?._id, "$videoLikes.likedBy"] },
          then: true,
          else: false,
        },
      },
    },
  },
]);
// console.log(fetchedVideo);

if (!fetchedVideo) throw new ApiError(404, "Video not found");

const currentUser = await User.findById(req.user._id);

if (!currentUser.watchHistory.includes(fetchedVideo[0]._id)) {
  const addVideoToUserWatchHistory = await User.findByIdAndUpdate(
    req.user._id,
    {
      $push: {
        watchHistory: fetchedVideo[0]._id,
      },
    }
  );

  if (!addVideoToUserWatchHistory)
    throw new ApiError(500, "Could not add video to watch history");
}

await Video.updateOne(
  {
    _id: new mongoose.Types.ObjectId(videoId),
  },
  {
    $inc: {
      views: 1,
    },
  }
);

return res
  .status(200)
  .json(new ApiResponse(200, fetchedVideo, "Video fetched successfully!"));
});


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title , description} = req.body
    
    if(!title || !description){
      throw new ApiError(400, "title and description is required")
    }
    
    const thumbnailLocalPath = req.file?.path;

    if(!thumbnailLocalPath) throw new ApiError(400, "thumbnail fields are required")

      const videoData = await Video.findById(videoId)
    

    const deleteThumbnail = await deleteOnCloudinary(videoData.thumbnail)

    if(!deleteThumbnail){
      throw new ApiError(401, "thumbnail is not deleted")
  }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail.url){
      throw new ApiError(400, "thumbnail are not found please check on cloudinary")
    }

    const updateVideoDetails =  await Video.findByIdAndUpdate(
      videoId,
      {
          $set: {
              title,
              description,
              thumbnail: thumbnail.url
          }
      },
      {new: true}
    )

    return res
    .status(200)
    .json(new ApiResponse(200, updateVideoDetails, "user videoDetails is updated successfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!videoId) throw new ApiError(400, "videoId is not find!")

    const deletedVideo = await Video.findByIdAndDelete(videoId)

    if(!deleteVideo) throw new ApiError(500, "something went wrong while deleting the video")

    return res 
    .status(200)
    .json(new ApiResponse(200, deletedVideo, "video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) throw new ApiError(400, "Invalid link");

   const video = await Video.findById(videoId)

   if(!video) throw new ApiError(500, "video is not found")

  const statusToggledVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !video.isPublished,
      },
    },
    { new: true }
  );

  if (!statusToggledVideo)
    throw new ApiError(400, "Error updating toggle video");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        statusToggledVideo,
        "Video publish status toggled successfully!"
      )
    );
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}