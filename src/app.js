import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
const App = express();

// App.use(cors()); normal confrigution
// we have to use "app.use " when we are handling middleware

// console.log(`${process.env.CORS_ORIGIN}`);
// this is how we can coustomise our cors;
// use to take encoded url;
App.use(express.urlencoded({
    extended:true,
    limit:"64kb",
}))
App.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
// use to limit in form of json;
App.use(express.json({
    limit:"32kb",
}));
// if any public file come then it will store on my local public folder
App.use(express.static("public"));
// for safe and secure crud operation on cookie on user browser
App.use(cookieParser());

// routes
import userRouter from "./routes/user.router.js"
// router declarations
App.use("/api/v1/users",userRouter);// yaha pe app.get use hota hai but humlog yaha pe prefer nhi kr rhe hai user router as a middleware jayega and user.Router.js me jake wo apna path continue karega  tab uska url kuch aisa banega   http://localhost:3000/users/.......    ab ..... ke jagha pe wo user router file me jake pta chalega ki kon sa route ko continue krna hai ans api/v1 means hai li api ka version1 usekr rhe hai 

export {App}