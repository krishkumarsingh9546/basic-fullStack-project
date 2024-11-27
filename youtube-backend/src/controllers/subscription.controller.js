import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if (!channelId) throw new ApiError(400, "Invalid Channel Link");

  const fetchedChannel = await User.findById(channelId);
  if (!fetchedChannel) throw new ApiError(404, "Channel not found");

  const isSubscribedToChannel = await subscription.findOne(
    {
      subscriber: req.user._id,
      channel: new mongoose.Types.ObjectId(channelId),
    },
    {
      new: true,
    }
  );
  if (isSubscribedToChannel) {
    await subscription.findByIdAndDelete(isSubscribedToChannel._id);
  } else {
    const subscribeToChannel = await subscription.create({
      subscriber: req.user._id,
      channel: new mongoose.Types.ObjectId(channelId),
    });
    if (!subscribeToChannel)
      throw new ApiError(500, "Failed to subscribe to channel");
  }

  return res
  .status(200)
  .json(new ApiResponse(200, fetchedChannel ,"Successfully subscribed/unsubscribed to channel"));
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!channelId) throw new ApiError(400, "invalid link please check again!")

      const allChannelSubscriber = await subscription.aggregate([
        {
          $match:{
            channel: new mongoose.Types.ObjectId(channelId)
          }
        },
        {
          $lookup:{
              from: "users",
              localField: "subscriber",
              foreignField: "_id",
              as: "channelSubscribers",

              pipeline: [
                {
                  $project:{
                    fullName: 1,
                    username: 1,
                    avatar: 1
                  }
                }
              ]
          }
        },
        {
          $addFields:{
            totalChannelSubscribers:{
              $size: "$channelSubscribers"
            }
          }
        }
      ])

      if(!allChannelSubscriber) throw new ApiError(500, "internal server error subscriber not found")

      return res
      .status(200)
      .json(new ApiResponse(200, allChannelSubscriber, "AllChannelSubscriber get successfullly"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!subscriberId) throw new ApiError(400, "inavlid link please cheack Again!")

      const subscribedChannel = await subscription.aggregate([
        {
          $match:{
            subscriber: new mongoose.Types.ObjectId(subscriberId)
          }
        },
        {
          $lookup:{
              from: "users",
              localField: "channel",
              foreignField: "_id",
              as: "subscribedChannels",

              pipeline: [
                {
                  $project:{
                    fullName: 1,
                    username: 1,
                    avatar: 1
                  }
                }
              ]
          }
        },
        {
          $addFields:{
            totalChannelSubscribers:{
              $size: "$subscribedChannels"
            }
          }
        }
      ])

      if(!subscribedChannel) throw new ApiError(500, "internal server error subscriber not found")

      return res
      .status(200)
      .json(new ApiResponse(200, subscribedChannel, "AllChannelSubscriber get successfullly"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}