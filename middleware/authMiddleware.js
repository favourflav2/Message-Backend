import jwt from 'jsonwebtoken'
import User from '../models/userModel.js';

// googleId token length is 21

export async function authMiddleware(req,res,next){
    let token;

    if(req.headers.authorization){
        
        try{
            token = req.headers.authorization.split(' ')[1]
            //console.log(token.length)

            // googleId is 21 anythig over 21 is a custom token genrated from jwt
            const customAuth = token.length > 30
            let decodedData;

            if(token && customAuth){
                decodedData = jwt.verify(token,process.env.SECRET)
                //console.log(decodedData)
                req.userId = decodedData?.id
            }else{
                const user = await User.findOne({googleId:token})
                req.userId = user._id
            }
            next()
        }catch(e){
            console.log(e)
            res.status(401).json({msg:"Not authorized, token failed"})
        }

    }
    if(!token){
        res.status(401).json({msg:"Not authorized, no token"})
    }
    
}