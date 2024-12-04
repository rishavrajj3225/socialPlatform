import { asynchandler } from "../utils/asynchandler.utils.js";
import { apiError } from "../utils/apierror.utils.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/fileuplod.utils.js";
import { apiResponse } from "../utils/apiResponse.utils.js";
// user ke pass humlog ke function ka access hoga and User ke pass mongo ke function ka access hoga
const generateAccessAndRefreshToken = async (UserId) => {
  try {
    const user = await User.findOne(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    // save krne me validation lagega but hum user ko hi access krke rakhe hai to problem nhi hai
    await user.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    throw new apiError(
      500,
      "Something went wrong in generating Access And Refresh Token"
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
  if (!username || !email) {
    throw new apiError(400, "Please provide  Email or Username");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) throw new apiError(400, "User not Exist");
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new apiError(400, "Incorrect Password");

  const { refreshToken, accessToken } = generateAccessAndRefreshToken(user._id);

  //yaha par jo user ka access mil rha hai usme refresh token nhi tha abhi just  generateAccessAndRefreshToken function me wo add kiya gya hai to ab fir se user ko update krna padega
  const loggedInUser = await User.findOne(user._id).select(
    "-password -refreshToken"
  );

  //cookie formation
  const options = {
    httpOnly: true,
    secure: true,
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
  )
  const options = {
    httpOnly: true,
    secure: true,
  }
   return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(200,"User Logout")
});

export { registerUser, loginUser, logoutUser };
