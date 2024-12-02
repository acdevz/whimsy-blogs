import express from 'express'
import { requireAuth } from '../middlewares/auth.middlewares.js'
import { 
    user_signin_post,
    user_signup_post,
    user_signout_get,
} from '../controllers/user.controllers.js'

const router = express.Router()

router.use(requireAuth)

router.post("/signin", user_signin_post)

router.post("/signup", user_signup_post)

router.get("/signout", user_signout_get)

export default router