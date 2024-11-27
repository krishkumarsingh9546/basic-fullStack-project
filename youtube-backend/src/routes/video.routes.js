import { Router } from "express";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.route("/AllVideos").get(verifyJWT, getAllVideos)
router.route("/publishVideo").post(verifyJWT, upload.fields([
    {
        name: "videoFile",
        maxCount: 1
    },
    {
        name: "thumbnail",
        maxCount: 1
    }

]), publishAVideo)
router.route("/:videoId").get(verifyJWT, getVideoById)
router.route("/:videoId").patch(verifyJWT, upload.single("thumbnail"), updateVideo)
router.route("/:videoId").delete(verifyJWT, deleteVideo)
router.route("/toggleStatus/:videoId").patch(verifyJWT, togglePublishStatus)



export default router