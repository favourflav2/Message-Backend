import cors from "cors";
import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import cloudinary from "./uploadImage.js";
import { Server } from "socket.io";

const app = express();

// Middleware
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use(morgan("dev"));
dotenv.config();

const port = process.env.PORT || 5001;

const localDevEnv = process.env.NODE_ENV

// MongoDB
mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("connect to mongoDb")
  })
  .catch((e) => {
    console.log(e);
  });

const server = app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
const io = new Server(server,{
  pingTimeout:60000,
  cors: {
    origin: process.env.PROD_URL
  }
});

io.on("connection", (socket) => {
  console.log("connected to socket.io")

  socket.on("setup", (userData) => {
    // joining room with logged in user
    socket.join(userData)
    console.log(userData)
    socket.emit("connected")
  })

  socket.on("join chat", (chatId) => {
    // joining room with selecedChat user array other user that is not the logged in user
    socket.join(chatId)
    console.log("user join room", chatId)
  })

  socket.on("typing",(room) => socket.in(room).emit("typing"))
  socket.on("stop typing",(room) => socket.in(room).emit("stop typing"))

  socket.on("new message", async (newMsg) => {
    //! Sending message modal back
    const res = await newMsg?.chat
    
    
    var chat = newMsg?.chat

    if(!res?.users){
      return console.log("users not defined")
    }
    
    

    res?.users?.forEach( user => {
      // if the logged in userId == the userId in users array we dont want to send the message to our selves
      // console.log(user,"uuuuuuuuu")
      // console.log(newMsg?.sender?._id,"idddididididi")
      if(user._id == newMsg?.sender?._id){
       return console.log("same user who sent")
      }

      // socket.in means inside that users room, emit/send message
      console.log("socket in")
      //console.log(newMsg)
      socket.in(user._id).emit("message recieved", newMsg)
    })
  })

  socket.off("setup", () => {
    console.log("user disconnected")
    socket.leave(userData)
  })

})
app.post("/api/uplaod", async (req, res) => {
  const fileStr = req.body.body;

  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    invalidate: true,
    resource_type: "auto",
  };

  try {
    const uploadLoadedRes = await cloudinary.uploader.upload(fileStr, options);
    
    
        res.send(uploadLoadedRes.url)
   
  } catch (e) {
    console.log(e);
    res.status(500).json(e.message);
  }
});
app.use("/auth", userRoutes);
app.use("/chat", chatRoutes);
app.use("/message", messageRoutes);
