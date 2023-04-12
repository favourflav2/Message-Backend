import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    userName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        
    },
    pic:{
        type:String,
        required:true,
        default:"https://w7.pngwing.com/pngs/831/88/png-transparent-user-profile-computer-icons-user-interface-mystique-miscellaneous-user-interface-design-smile-thumbnail.png"
    },
    googleId:{
        type:String
    },
},{timestamps:true})

const User = mongoose.model("user",userSchema)
export default User