import mongoose from "mongoose";

const message = mongoose.Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    content:{
        type:String,
        trim:true
    },
    chat:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"chat"
    }
},{timestamps:true})

export const Messgae = mongoose.model("message",message)