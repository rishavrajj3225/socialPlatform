import {asynchandler} from "../utils/asynchandler.utils.js"

const registerUser= asynchandler(async(req,res)=>{
    res.status(200).json({
        message:"OK",
    })
})


export {registerUser}