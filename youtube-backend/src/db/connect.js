import mongoose  from "mongoose";
import {DB_NAME} from "../constrants.js";

const connectDB = async () => {
    try {
     const  connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}?retryWrites=true&w=majority`)
     console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`)
    } 
    catch (error) {
        console.log("MongoDb error is", error);
        process.exit(1)
    }
}

export default connectDB