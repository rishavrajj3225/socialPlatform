
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
// const connectDB = () => {
//   try {
//     // as these connect function return a object we can store in a variable
//     const connectioinInstance = mongoose.connect(
//       `${process.env.MONGODB_URI}/${DB_NAME}`
//     );
    
//     console.log(
//       `MongoDB connected!!!! DB with port ${process.env.PORT} `
//     );
//   } catch (error) {
//     console.log("ERROR on connection with mongodb", error);
//     process.exit(1);
//   }
// };
async function main() {
  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
  console.log("connected");
  
}
export default connectDB;
