import express from 'express'
import { requireAuth } from '../middlewares/auth.middlewares.js'
import { 
    blog_index,
    blog_about_get,
    blog_post,
    blog_create_get,
    blog_create_post,
    blog_delete,
    blog_edit_get,
    blog_edit_post,
    blog_search_get,
    blog_signin_get,
    blog_signup_get,
    user_search_get,
} from '../controllers/blog.controllers.js'

const router = express.Router()

router.use(requireAuth)

router.get("/", blog_index)

router.get("/about", blog_about_get)

router.get("/signin", blog_signin_get)

router.get("/signup", blog_signup_get)

router.get("/search", blog_search_get)

router.get("/search/users", user_search_get)

router.get("/create", blog_create_get)

router.post("/", blog_create_post)

router.get("/:slug", blog_post)

router.delete('/:id', blog_delete)

router.get('/edit/:slug', blog_edit_get)

router.post("/edit", blog_edit_post)


export default router