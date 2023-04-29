import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from 'axios'

export async function sign_Up(req, res) {
  const { userName, email, password,imageFile } = req.body;
  //console.log(req.body)
  try {
    const alreadyUser = await User.findOne({ email });
    if (alreadyUser) {
      return res.status(400).json({ msg: "Email is already being used" });
    }

    const hash = await bcrypt.hash(password, 12);
    const user1 = imageFile?.length ? await new User({ userName, email, password: hash,pic:imageFile }) : await new User({ userName, email, password: hash })
    const token = jwt.sign(
      { email: user1.email, id: user1._id },
      process.env.SECRET,
      { expiresIn: "3h" }
    );

    await user1.save();
    const user = {
      _id: user1._id,
      userName: user1.userName,
      email:user1.email,
      pic: user1.pic
    }

    res.status(200).json({ token, user });
  } catch (e) {
    console.log(e);
    res.status(404).json({ msg: e.message });
  }
}

export async function log_In(req, res) {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "No user by that email" });
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      const token = jwt.sign(
        { email: user.email, id: user._id },
        process.env.SECRET,
        { expiresIn: "3h" }
      );

      if (!isMatch) {
        return res
          .status(404)
          .json({ msg: "Sorry the password you entered does not match" });
      } else {
        const {password,...otherData} = user._doc
        return res.status(200).json({ user:otherData, token });
      }
    }
  } catch (e) {
    console.log(e);
    res.status(404).json({ msg: e.message });
  }
}

export async function googleSign_In(req,res){
    const {userName,email,sub} = req.body

    try{
        let oldUser = await User.findOne({email})
        if(oldUser){
            if(oldUser.googleId){
                const user = oldUser
                return res.status(200).json({token:sub,user}) 
            }else{
                return res.status(404).json({msg:"Email is already being used"})
            }
            // const pic = "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"
            // const user = {_id:oldUser._id.toString(),email,userName,googleId:sub,pic,createdAt,updatedAt}
            

            // return res.status(200).json({token:sub,user})
        }

        const user = await new User({email,userName,googleId:sub})
        await user.save()
        res.status(200).json({user,token:sub})

    }catch(e){
        console.log(e);
        res.status(404).json({ msg: e.message });
    }
}

export async function get_All_Users(req,res){

  // we are searching the name and email in all our users to see if it matches the search query
  //* $regex ... Provides regular expression capabilities for pattern matching strings in queries.
  // options i ... case sensitive
  const keyword = req.query.search ? {
    $or:[
      {userName:{$regex: req.query.search, $options: "i"}},
      {email:{$regex: req.query.search, $options: "i"}},
    ]
  }:{ }

  // const users = await User.find(keyword).find({_id:{$ne:req.userId}}).populate("users", "-password")
  // .select("-password")
  // .findIndex({_id:{$ne:req.userId}})
  
  
    try{
      const users = await User.find(keyword).find({_id:{$ne:req.userId}}).select("-password")
      
      res.send(users)

    }catch(e){
      console.log(e)
      res.status(400).json({msg:e.message})
    }
}

