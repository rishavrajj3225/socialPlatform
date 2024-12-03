// try catch handler
//  const asynchandler= (fn)=> {
//     async(req,res,next)=>{
//         try {
//             await fn(req,res,next);
//         } catch (error) {
//             res.status(err.code||500).json({
//                 success:false,
//                 message:err.message
//             })

//         }
//     }
// }

// Promise handler
const asynchandler=(requsthandler)=>{
    (req,res,next)=>{
        Promise.resolve(requsthandler(req,res,next)).catch(err=>next(err))
    }
}

export {asynchandler}