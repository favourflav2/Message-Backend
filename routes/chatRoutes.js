import { Router } from "express";
import { access_Chat, addToGroup, createGroupChat, getAllChatsByUser, removeFromGroup, renameGroupChat } from "../controller/chatController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = Router()

router.post("/",authMiddleware,access_Chat)
router.get("/",authMiddleware,getAllChatsByUser)
router.post("/group",authMiddleware,createGroupChat)
router.put("/update",authMiddleware,renameGroupChat)
router.put("/removeFromGroup",authMiddleware,removeFromGroup)
router.put("/addToGroup",authMiddleware,addToGroup)

export default router