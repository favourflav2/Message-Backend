import { Chat } from "../models/chatModel.js";
import User from "../models/userModel.js";

//! Population
// TODO .population allows us to reference documents in other collections

// Our chatModel has a users array... it has a ref and an objectId type for relations
//* This array is going to store all the user we create ids

export async function access_Chat(req, res) {
  // creating or fetching a one on one chat
  const { userId } = req.body;
  
  
  if (!userId) {
    console.log("userId param was not sent with request");
    return res
      .status(400)
      .json({ msg: "userId param was not sent with request" });
  }

  //* Since the users array in the chatModel contains all the user ids we check if only the logged in user and the user we want to create a message with gets returned
  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      // userId of logged in user
      { users: { $elemMatch: { $eq: req.userId } } },
      // id from req.body (frontend)
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  // var = ischat is trying to find the chat of the two users
  //* if theres a chat in our database with the two users we populate an array of the two users
  //! if theres no chat with the two users we craete a chat
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    // if theres already a chat we are just going to send the chat basically returning it
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.userId, userId],
    };

    try {
      // chat created by logged in user and user selcted
      const createdChat = await Chat.create(chatData);

      // once the chat is created we are grabbing the users of the chat and returning them
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );

     res.status(200).json(FullChat);
    } catch (e) {
      console.log(e);
      res.status(400).json({ msg: e.message });
    }
  }
}

export async function getAllChatsByUser(req, res) {
  // GroupAdmin is the logged in user
  try {
    const allChats = await Chat.find({
      users: { $elemMatch: { $eq: req.userId } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    const isChat = await User.populate(allChats, {
      path: "latestMessage.sender",
      select: "name pic email",
    });
    res.send(isChat);
  } catch (e) {
    console.log(e);
    res.status(400).json({ msg: e.message });
  }
}

export async function createGroupChat(req, res) {
  if (!req.body.users || !req.body.name) {
    return res.status(400).json({ msg: "Please Fill all feilds" });
  }

  // the users from frontend we want to create a groupchat with
  var users = req.body.users;
  //console.log(users);

  if (users.length < 2) {
    return res
      .status(400)
      .json({ msg: "More than 2 users are required to form a group chat" });
  }

  users.push(req.userId);

  try {
    // This is the created group chat, however we still need to actually send it back to the user
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.userId,
    });

    // when we populate its only populates one then the next
    //* So for this response we populate all the users in group chat
    // then we populated another thing and that is the groupAdmin
    //* All sepratly
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (e) {
    console.log(e);
    res.status(400).json({ msg: e.message });
  }
}

export async function renameGroupChat(req, res) {
  const { chatId, chatName } = req.body;
  
   try {
     const updatedChat = await Chat.findByIdAndUpdate(
       chatId,
       {
         chatName: chatName,
       },
       {
         new: true,
       }
     )
       .populate("users", "-password")
       .populate("groupAdmin", "-password");

     if (!updatedChat) {
       return res.status(404).json({ msg: "Chat not found" });
     } else {
       res.status(200).json(updatedChat);
     }
   } catch (e) {
     console.log(e);
     res.status(400).json({ msg: e.message });
   }
}

export async function addToGroup(req, res) {
  const { chatId, userId } = req.body;
  
       const addedTo = await Chat.findByIdAndUpdate(
         chatId,
         {
           $push: { users:  userId },
         },
         {
           new: true,
         }
       )
         .populate("users", "-password")
         .populate("groupAdmin", "-password");

       if (!addedTo) {
         return res
           .status(404)
           .json({ msg: "Something went wrong adding a user to groupchat" });
       } else {
         res.status(200).json(addedTo);
       }
  
    
 
}

export async function removeFromGroup(req,res){
    const { chatId, userId } = req.body;
    

  try {
    const removeFrom = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users:  userId  },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!removeFrom) {
      return res
        .status(404)
        .json({ msg: "Something went wrong removing a user from groupchat" });
    } else {
      res.status(200).json(removeFrom);
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({ msg: e.message });
  }
}
