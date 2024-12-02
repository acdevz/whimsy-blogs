import express from 'express'

const router = express.Router()

router.get("/", (req, res) => {
    res.redirect("/blogs")
})

router.get("/about", (req, res) => {
    res.render("about", { title: "About" })
})

import { requireAuth } from '../middlewares/auth.middlewares.js'
import { 
    user_profile_get,
    user_settings_get,
} from '../controllers/user.controllers.js'

router.get("/@:username", requireAuth, user_profile_get)

router.get("/me/settings", requireAuth, user_settings_get)

export default router