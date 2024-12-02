import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
const connectDB= async ()=>{
    try {
        // as these connect function return a object we can store in a variable
       const connectioinInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
       console.log(`MongoDB connected!!!! DB Host: ${connectioinInstance.connection.host}`);
    } catch (error) {
        console.log("ERROR on connection with mongodb",error);
        process.exit(1);
    }
}

export default connectDB;
