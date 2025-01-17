// require("dotenv").config({path:'./.env'});
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
// import connectDB from "./db/db.index.js";
import { App } from "./app.js";
const app = express();
dotenv.config();

// connectDB();

// always connect data base in iffi function and start iffi with a ; to avoide error
// always use async and await statment and try catch statment
// always assume that db is in another world
// console.log(`${process.env.MONGODB_URI}/${DB_NAME}`);

(async() => {
  try {
   await mongoose.connect(`${process.env.MONGODB_URI}`);
    console.log("Database connection successful!");
    App.on("error", (error) => {
      console.log("Error", error);
      throw error;
    });
    App.listen(process.env.PORT, () => {
      console.log(`app is runnning on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("ERROR : ", error);
    throw error;
  }
})();
