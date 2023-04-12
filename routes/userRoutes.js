import {Router} from 'express'
import { get_All_Users, googleSign_In, log_In, sign_Up } from '../controller/userController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
const router = Router()

router.post("/signup",sign_Up)
router.post("/login",log_In)
router.post("/google",googleSign_In)


// get
router.get("/getAllUsers",authMiddleware,get_All_Users)

export default router