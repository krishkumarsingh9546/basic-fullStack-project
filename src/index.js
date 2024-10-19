import connectDB from "./db/connect.js";
import dotenv from "dotenv";


dotenv.config({
    path: './env'
})


connectDB()