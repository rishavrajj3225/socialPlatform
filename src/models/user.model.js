import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, //to enable searching field
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //url chaiye bass
      required: true,
    },
    coverimage: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.type.Types.Objectid,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// pre ke callback me kabhi v arrow function ka use nhi krna hai kyunki waha pe this pointer ka access nhi hota hai;
// pre ka matlab hota hai ki kuch krne se just pahle like db me val save krne se pahle

userSchema.pre("save",async function (next) {
    if(!this.isModified("password")) return next();
    this.password=bcrypt.hash(this.password,10);// jisko hash krna hai uska name and number of round to hash and this will change the password everytime means if we just change name then it will automatically change password also to avoide this we prefere to control it with if statment
    next();
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password)
}

// jwt methods
userSchema.methods.generateAccessToken= async function name(params) {
   return  jwt.sign(
      {
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }
    );
}
userSchema.methods.generateRefreshToken= async function name(params) {
    return jwt.sign(
      {
        _id: this._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      }
    );
}
export const User = mongoose.model("User", userSchema);
