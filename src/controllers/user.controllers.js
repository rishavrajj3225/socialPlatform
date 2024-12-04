import { asynchandler } from "../utils/asynchandler.utils.js";
import { apiError } from "../utils/apierror.utils.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/fileuplod.utils.js";
import { apiResponse } from "../utils/apiResponse.utils.js";
const registerUser = asynchandler(async (req, res) => {
  //get user details from froentend : username, email,full name ,coverimage , avatar,password
  // validatation - is not empty
  // check if user is allready exist or name : username , email
  //check for images and avatar(compulsary)
  // upload to cloudinary, also again check for avatar
  // create user object : create object in db
  // remove password and refresh token from response
  //check for user creation
  // return response

  const { fullName, username, email, password } = req.body; // form ya json se data aa rha hai to req.body se mil jayega mujhe
  console.log(email);
  console.log(password);
  //   if(fullName===""){
  //     throw new apiError(400,"Full name is required")
  //   }
  // we  can check by if condition on every field but we can also use .some function
  if (
    [fullName, username, email, password].some((data) => data?.trim() === "")
  ) {
    throw new apiError(400, "Please fill the compulsory fields");
  }
  // jo user ko import kiye hai wo data base se intract kr shkta hai kyunki wo mongoose se bna hai means user hi mere behalf pe mongodb ko call karega
  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser)
    throw new apiError(400, "User already exist with username or email");

  //  req.file is given by multer
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverimageLocalPath = req.files?.coverimage[0]?.path;
  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar not found");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverimage = await uploadOnCloudinary(coverimageLocalPath);
  if(!avatar){
    throw new apiError(400, "Avatar not found");
  }
   const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverimage: coverimage?.url||"",
    email,
    password,
    username : username.toLowerCase()
  })
  // yaha pe humko fir se ek baar dekhna padega ki user banega ki nhi
 const createdUser = await User.findById(user._id).select(
    // select statment by default sabko select krleta hai to usme se humko remove krna padega kuch kuch 
   "-password -refreshToken"
 );
 if(!createdUser){
    throw new apiError(500,"Somthing Went wrong while registring a user");
 }
  return res.status(201).json(
   new  apiResponse(200,createdUser,"User created successfully")
)
});
export { registerUser };
