import { apiError } from "../utils/apierror.utils.js";
import { asynchandler } from "../utils/asynchandler.utils.js";
import {User} from "../models/user.model.js ";
import JWT from "jsonwebtoken";

const verifyJWT = asynchandler(async (req, res, next) => {
  // yaha pe mere req ke pass user ka cookie ka access hai to uska use krte hai

  // yaha pe error aa rha tha kyunki mobile me cokie to hota nhi hai to wo to header bhejta hai to uss case me galat h jayega to usko req.header se krte hai and isko postman me check krte time key,value me
  // Authorization: Bearer <Token>  bhejte hai
  try {
    const token =
      req.cookie?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) throw new apiError(401, "Unuthorized Request");

    // is token ke pass hum pahle se bahut sara value bheje hai naa to check kro usko
    const decodedToken = JWT.verify(token, proccess.env.SECRET_KEY);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) throw new apiError(400, "User not found");
    // ab  yaha pe user hai hi hai
    req.user = user;
    next();
  } catch (error) {
    throw new apiError(400, "Something went wrong in Auth middleware")
  }
});

export { verifyJWT };