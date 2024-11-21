import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
     addVideoToPlaylist, createPlaylist, 
     deletePlaylist, getPlaylistById, getUserPlaylists,
     removeVideoFromPlaylist, updatePlaylist
    } 
    from "../controllers/playlist.controller.js";

const router = Router()

router.route("/createPlaylist/:videoId").post(verifyJWT , createPlaylist)
router.route("/:userId").get(verifyJWT , getUserPlaylists)
router.route("/:playlistId").delete(verifyJWT , deletePlaylist)
router.route("/getPlaylist/:playlistId").get(verifyJWT , getPlaylistById)
router.route("/addVideoToPlaylist/:playlistId/:videoId").patch(verifyJWT , addVideoToPlaylist)
router.route("/RemoveVideoToPlaylist/:playlistId/:videoId").delete(verifyJWT , removeVideoFromPlaylist)
router.route("/:playlistId").patch(verifyJWT , updatePlaylist)

export default router