import mongoose, {isValidObjectId, Types} from "mongoose"
import {PlayList} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
     //TODO: create playlist
    if( !(name || description)) throw new ApiError(400, "Name and description both are required")

        const newCreatePlaylist = await PlayList.create({
            name,
            description,
            playListVideos: [],
            owner: req.user._id
        })
     
        if(!newCreatePlaylist) throw new ApiError(500, "playlist is not created please check!")

     return res
     .status(200)
     .json(new ApiResponse(200, newCreatePlaylist, "playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!userId) throw new ApiError(400, "invalid link for userId")

        const allPlayList = await PlayList.aggregate([
            {
                $match:{
                    owner: new mongoose.Types.ObjectId(userId)
                }
            },
        ])

        if(!allPlayList) throw new ApiError(500, "can't get Allplaylist")


        return res
        .status(200)
        .json(new ApiResponse(200, allPlayList, "User AllPlaylist get successFully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!playlistId) throw new ApiError(400, "invalid Playlist id")

    const fectchedPlaylist = await PlayList.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "playListVideos",
                foreignField: "_id",
                as: "playListVideos",

                pipeline:[
                    {
                        $lookup:{
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "VideoOwner",

                            pipeline:[
                                {
                                    $project:{
                                        username:1,
                                        fullName:1
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                palyListVideoCount: {
                    $size: "$playListVideos"
                }
            }
        }
    ])

    if(!fectchedPlaylist) throw new ApiError(500, "internal server error playList not found")

        return res
        .status(200)
        .json(new ApiResponse(200, fectchedPlaylist, "playlist found successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!(playlistId || videoId)) throw new ApiError(400, "playlist and video Id are not found")

    const fetchedVideo = await Video.findById(videoId)
      if(!fetchedVideo) throw new ApiError(400, "video not found")

    const fetchedPlayList = await PlayList.findById(playlistId)
    if(!fetchedPlayList) throw new ApiError(404, "playlist not found")

        if(!fetchedPlayList.playListVideos.includes(fetchedVideo._id)) {
            const videoAddedToPlaylist = await PlayList.findByIdAndUpdate(playlistId , {
                $push:{
                    playListVideos: fetchedVideo
                }
            },
            {
                new: true
            }
        );
        if(!videoAddedToPlaylist) throw new ApiError(500, "can't add the video to the palylist");
        }

    return res
    .status(200)
    .json(new ApiResponse(200, fetchedVideo, "video added to the playlist successfully"))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!playlistId) throw new ApiError(400, "invalid playlist id")

    const deletedPlaylist = await PlayList.findByIdAndDelete(playlistId)

    if(!deletedPlaylist) throw new ApiError(500, "can't get delete the palylist")

    return res
    .status(200)
    .json(new ApiResponse(200, deletedPlaylist, "playlist delted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}