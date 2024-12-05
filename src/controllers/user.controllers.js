import { asynchandler } from "../utils/asynchandler.utils.js";
import { apiError } from "../utils/apierror.utils.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/fileuplod.utils.js";
import { apiResponse } from "../utils/apiResponse.utils.js";
import jwt from "jsonwebtoken";
// user ke pass humlog ke function ka access hoga and User ke pass mongo ke function ka access hoga
const generateAccessAndRefreshToken = async (userId) => {
  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) throw new apiError(404, "User not found");

    // Generate access and refresh tokens
    const accessToken = user.generateAccessToken(); // Assuming method exists in the User schema
    const refreshToken = user.generateRefreshToken(); // Assuming method exists in the User schema

    // Update the user's refresh token
    user.refreshToken = refreshToken;

    // Save user without triggering validation
    await user.save({ validateBeforeSave: false });

    // Return both tokens
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error in generateAccessAndRefreshToken:", error.message);
    throw new apiError(
      500,
      "Something went wrong in generating Access and Refresh Tokens"
    );
  }
};

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
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser)
    throw new apiError(400, "User already exist with username or email");
  // if(await User.find({email})){
  //    throw new apiError(400, "User already exist with this email");
  // }
  // if(await User.find({username})){
  //    throw new apiError(400, "User already exist with this username");
  // }

  //  req.file is given by multer
  const avatarLocalPath = req.files?.avatar[0]?.path;
  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar not found1");
  }
  // aisa statment likhne ke baad humlog ko zarur se check kr lena hai ki field exist krta hai ki nhi kyunki agar exist nhi krta hai to undifined dega aur error dega jab hum uska .url access karenge
  // const coverimageLocalPath = req.files?.coverimage[0]?.path;
  let coverimageLocalPath = "";
  if (
    req.files &&
    Array.isArray(req.files.coverimage) &&
    req.files.coverimage.lenth > 0
  ) {
    coverimageLocalPath = req.files?.coverimage[0]?.path;
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverimage = await uploadOnCloudinary(coverimageLocalPath);
  if (!avatar) {
    throw new apiError(400, "Avatar not found2");
  }
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverimage: coverimage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  // yaha pe humko fir se ek baar dekhna padega ki user banega ki nhi
  const createdUser = await User.findById(user._id).select(
    // select statment by default sabko select krleta hai to usme se humko remove krna padega kuch kuch
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new apiError(500, "Somthing Went wrong while registring a user");
  }
  return res
    .status(201)
    .json(new apiResponse(200, createdUser, "User created successfully"));
});

const loginUser = asynchandler(async (req, res) => {
  // steps;
  // req.body se data le ke aa jao
  // username ya email se login krwana padega
  //find the user
  // password check
  // access and refresh token dono milega
  // send in secure cookies
  const { email, username, password } = req.body;
  if (!(username || email)) {
    throw new apiError(400, "Please provide  Email or Username");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) throw new apiError(400, "User not Exist");
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new apiError(400, "Incorrect Password");

  //aage me await lagana zaruri hai kyunki uss function ke ander me await call tha
  const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
    user._id
  );
  //yaha par jo user ka access mil rha hai usme refresh token nhi tha abhi just  generateAccessAndRefreshToken function me wo add kiya gya hai to ab fir se user ko update krna padega
  const loggedInUser = await User.findOne(user._id).select(
    "-password -refreshToken"
  );

  //cookie formation
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // Optional for security
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User loggedIn successfully"
      )
    );
});

const logoutUser = asynchandler(async (req, res) => {
  //cookie delete krna padega
  //refresh token ko v reset krna padega
  // yaha pe user se hum kuch lenge to nhi naa to thoda dikkat hai to mujhe middleware ka help lena padega

  // req.user._id //yaha pe req.user middleware ke wajah se aaya hai and uske pass user ka id hai and cookie wala sab kuch hai
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true, // isse mujhe new wala refreshToken dega
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(200, "User Logout");
});
const refreshAccessToken = asynchandler(async (req, res) => {
  // mujhe refresh token chaiye rahega and usko me cookie se access kr shkta hoon naa
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) throw new apiError(401, "Unauthorized Request");

  // yaha pe apne refresh token se verify krwa lenge
  // verify  function ek token lega and usko access krne ke liye secret lega
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);

    if (!user) throw new apiError(401, "Invalid Refresh token");

    //ab yaha pe incoming wala refresh token v aa gya hai and ek user ke pass hum save krwa ke rakhe the naa to match krwa lete hai
    if (incomingRefreshToken !== user.refreshToken)
      throw new apiError(401, " refresh token is expired");
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newrefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(201)
      .cookie("accessToken:", accessToken)
      .cookie("refreshToken:", newrefreshToken)
      .json(
        new apiResponse(
          200,
          { accessToken, refreshToken: newrefreshToken },
          "refreshToken refreshed"
        )
      );
  } catch (error) {
    throw new apiError(401, "error in refreshing the token");
  }
});

const changeCurrentPassword = asynchandler(async (req, res) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;
  // yaha pe user change krna chah rha hai to surely wo logged in hoga means hum req.user se uska id le shkte hai
  if (newPassword != confirmNewPassword)
    throw new apiError(400, "Confirm Password must be same as new one");

  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) throw new apiError(400, "Old Password is incorrect");

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new apiResponse(200, {}, "password updated successfully"));
});

const getCurrentUser = asynchandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.user, "Current User Fetched Successfully");
});

const updateAccountDetails = asynchandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new apiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email: email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar= asynchandler(async(req,res)=>{
 const avatarLocalPath= req.file?.path;
 if(!avatarLocalPath) throw new apiError(400,"File not avaliable ");
  const avatar=await uploadOnCloudinary(avatarLocalPath);
  if(!avatar.url){
    throw apiError(500,"Somthing went wrong on Avtar update");
  }
 const user= await User.findByIdAndUpdate(req.user?._id,{
    $set:{
      avatar : avatar.url
    }
  },{new:true}).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
})

const updateUserCoverImage= asynchandler(async(req,res)=>{
 const CoverImageLocalPath= req.file?.path;
 if(!CoverImageLocalPath) throw new apiError(400,"File not avaliable ");
  const coverimage=await uploadOnCloudinary(CoverImageLocalPath);
  if(!coverimage.url){
    throw apiError(500,"Somthing went wrong on Cover Image update");
  }
  const user=await User.findByIdAndUpdate(req.user?._id,{
    $set:{
     coverimage:coverimage.url
    }
  },
  {new:true}).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image updated successfully"));
})


export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage
};
