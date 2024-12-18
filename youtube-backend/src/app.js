import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16Kb"}))
app.use(express.urlencoded({extended: true, limit: "16Kb"}))
app.use(express.static("public"))
app.use(cookieParser())


// routes import

import  userRouter from './routes/user.route.js'
import  tweetRouter from './routes/tweet.route.js'
import  videoRouter from './routes/video.routes.js'
import  commentRouter from './routes/comment.route.js'
import  PlaylistRouter from './routes/playlist.route.js'
import  subscriptionRouter from './routes/subscription.route.js'
import likeRouter from './routes/like.route.js'

// routes declaration

app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/playLists", PlaylistRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/likes", likeRouter)

export{app}