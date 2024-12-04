import { Router } from "express";
import {loginUser, registerUser, logoutUser } from "../controllers/user.controllers.js";
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

router.route("/logout").post(verifyJWT,logoutUser)



export default router;
