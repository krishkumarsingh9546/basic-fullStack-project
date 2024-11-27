import connectDB from "./db/connect.js";
import dotenv from "dotenv";
import { app } from "./app.js";


dotenv.config({
    path: './env'
})

let port = process.env.PORT;


connectDB()
.then(() => {
    app.listen(port , () => {
        console.log(`server is running on ${port}`)
    })
})
.catch((err) => {
    console.log("MongoDb connection failed !!", err)
})


app.get("/", (req, res) => {
    res.send("hello brother");
})