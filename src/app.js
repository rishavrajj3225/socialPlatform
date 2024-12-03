import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
const App = express();

// App.use(cors()); normal confrigution
// we have to use "app.use " when we are handling middleware

// console.log(`${process.env.CORS_ORIGIN}`);
// this is how we can coustomise our cors;
App.use(cors(
    {
        origin:process.env.CORS_ORIGIN,
        Credential:true
    }
))
// use to limit in form of json;
App.use(express.json({
    limit:"32kb",
}));
// use to take encoded url;
App.use(express.urlencoded({
    extended:true,
    limit:"32kb"
}))
// if any public file come then it will store on my local public folder
App.use(express.static("public"));
// for safe and secure crud operation on cookie on user browser
App.use(cookieParser());

export {App}