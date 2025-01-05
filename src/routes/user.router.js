import { Router } from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxcount: 1,
    },
    {
      name: "coverimage",
      maxcount: 3,
    },
  ]),
  registerUser
);
router.route("/login").post(loginUser)

// secured route means user login hona hi chaiye
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refreshToken").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/getUser").get(verifyJWT, getCurrentUser);
router.route("/update-details").post(verifyJWT, updateAccountDetails);
router.route("/update-avatar").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  verifyJWT, 
  updateUserAvatar
);
router.route("/update-coverImage").post(
  upload.fields([
    {
      name: "coverimage",
      maxCount: 1,
    },
  ]),
  verifyJWT,
  updateUserCoverImage
);


export default router;
