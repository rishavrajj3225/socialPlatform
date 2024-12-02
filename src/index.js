// require("dotenv").config({path:'./env'});
import dotenv from 'dotenv'
import express from "express";
const app = express();
dotenv.config();

import connectDB from "./db/db.index.js";

connectDB();

/*
// 2.
// always connect data base in iffi function and start iffi with a ; to avoide error
// always use async and await statment and try catch statment
always assume that db is in another world

;(async()=>{
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
       app.on("error",(error)=>{
        console.log("Error",error);
        throw error;
       })
        app.listen(process.env.PORT,()=>{
            console.log(`app is runnning on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.error("ERROR : ",error);
        throw error;
    }
})

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/test");

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}


*/
