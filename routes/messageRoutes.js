import {Router} from "express"
import { allMessages, sendMessage } from "../controller/messageController.js"
import { authMiddleware } from "../middleware/authMiddleware.js"
const router = Router()

router.post("/sendMessage",authMiddleware,sendMessage)
router.get("/:chatId",authMiddleware,allMessages)

export default router