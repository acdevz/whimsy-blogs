import dateFns from "date-fns"
import readingTime from 'reading-time'
import Blog from "../models/blog.model.js"
import User from "../models/user.model.js"
import Comment from "../models/comment.model.js"

const perPage = 10

const blog_index = async (req, res) => {
    const feed = req.query?.feed
    const page = req.query.p || 1
    let blogs = []
    let count = 0
    try{
        if(!feed){
            [blogs, count] = await Blog.find({ status: "published" })
                .sort({ createdAt: -1 })
                .skip(page * perPage - perPage)
                .limit(perPage)
                .then( async (blogs) => {
                    blogs.forEach((blog) => {
                        blog.timestamp = dateFns.formatDistanceToNow(new Date(blog.updatedAt), { addSuffix: true })
                    })
                    count = await Blog.count({});
                    return [blogs, count]
                })
        } 
        else if(feed == "following"){
            if( !req.user ){
                res.redirect("/blogs/signin")
                return
            }
            [blogs, count] = await Blog.find({ 'author.userId' : { $in: req.user.following }, status: "published" })
                .sort({ createdAt: -1 })
                .skip(page * perPage - perPage)
                .limit(perPage)
                .then( async (blogs) => {
                    blogs.forEach((blog) => {
                        blog.timestamp = dateFns.formatDistanceToNow(new Date(blog.updatedAt), { addSuffix: true })
                    })
                    count = await Blog.count({ 'author.userId' : { $in: req.user.following } });
                    return [blogs, count];
                })
        }
        const pageCount = Math.ceil(count / perPage);
        const nextPage = parseInt(page) + 1;
        const prevPage = parseInt(page) - 1;
        const hasNextPage = nextPage <= pageCount;
        const hasPrevPage = prevPage >= 1;
    
        res.render("index", { 
            title: "Home", 
            blogs,
            currentPage: page,
            nextPage: hasNextPage ? nextPage : null,
            prevPage: hasPrevPage ? prevPage : null,
            tab : feed,
            res: {
                user : req.user,
            }
        })
    }
    catch(err){
        res.status(404).render("404", { title: "404" })
        console.log(err)
    }
}

const blog_about_get = (req, res) => {
    res.render("about", { 
        title: "About", 
        res: {
            user : req.user,
        }
    })
}

const blog_post = (req, res) => {
    const slug = req.params.slug
    Blog.findOne({slug})
    .then(async (blog) => {
        let [author, comments] = await Promise.all([
            await User.findOne({ _id: blog.author.userId }),
            await Comment.find({ blogId: blog._id })
        ])
        comments = await Promise.all(
            comments.map(async (comment) => {
                comment.user = await User.findOne({ _id: comment.userId })
                return comment
            })
        )
        if(!req.user){
            res.render("./blogs/posts", { 
                title: "Blog Post", 
                blog,
                author,
                comments,
                res: {
                    user : null, 
                    isAuthor : null
                } 
            })
            return
        }
        let isAuthor = false;
        if(req.user._id.toString() == blog.author.userId.toString()) isAuthor = true
        res.render("./blogs/posts", { 
            title: "Blog Post", 
            blog,
            author,
            comments,
            res: {
                user : req.user, 
                isAuthor
            } 
        })
    })
    .catch((err) => {
        res.status(404).render("404", { title: "404" })
        console.log(err)
    })
}

const blog_create_get = (req, res) => {
    if( !req.user ){
        res.redirect("/blogs/signin")
        return
    }
    res.render("./blogs/create", { 
        title: "Create a new blog",
        res: {
            user : req.user,
        }
    })
}

const blog_create_post = (req, res) => {
    const {title, snippet, content, status, premium} = req.body
    let slug = title.replace(/[\W_]+/g, "-").toLowerCase();
    if(status === "draft")
        slug = `${req.user?.username}-${title.replace(/[\W_]+/g, "-").toLowerCase()}`
    const blog = new Blog({
        slug, 
        title, 
        snippet, 
        content, 
        status,
        premium,
        'author.userId' : req.user._id, 
        'author.username' : req.user.username,
        'author.fullName' : req.user.fullName, 
        readTime : readingTime(content).text 
    })
    blog.save()
    .then(() => {
        if(status === "published") 
            res.redirect(`/@${req.user.username}`)
        else
            res.redirect(`/@${req.user.username}?tab=drafts`)
    })
    .catch((err) => {
        res.status(404).render("404", { title: "404" })
        console.log(err)
    })
}

const blog_delete = (req, res) => {
    Blog.findByIdAndDelete(req.params.id)
    .then(data => {
        if( !req.user || req.user._id.toString() != data.author.id.toString() ){
            res.redirect("/blogs/signin")
            return
        }
        res.json({ redirect: "/blogs" })
    })
    .catch(err => {
        console.log(err)
        res.status(404).render("404", { title: "404" })
    });
}

const blog_edit_get = (req, res) => {
    const slug = req.params.slug
    Blog.findOne({slug})
    .then((blog) => {
        if( !req.user || req.user._id.toString() != blog.author.userId.toString() ){
            res.redirect("/blogs/signin")
            return
        }
        res.render("./blogs/edit", { 
            title: "Editor", 
            blog,
            res: {
                user : req.user,
            }
        })
    })
    .catch((err) => {
        res.status(404).render("404", { title: "404" })
    })
}

const blog_edit_post = (req, res) => {
    const {_id, title, snippet, content, status, premium} = req.body
    const slug = title.replace(/[\W_]+/g, "-").toLowerCase()
    const blog = {
        slug, 
        title, 
        snippet, 
        content, 
        status,
        premium,
        readTime : readingTime(content).text 
    }
    Blog.findByIdAndUpdate(_id, blog , { new: true })
    .then((blog) => {
        if( !req.user || req.user._id.toString() != blog.author.userId.toString() ){
            res.redirect("/blogs/signin")
            return
        }
        if(status === "published") 
            res.redirect(`/@${req.user.username}`)
        else
            res.redirect(`/@${req.user.username}?tab=drafts`)
    })
    .catch((err) => {
        res.status(404).render("404", { title: "404" })
        console.log(err)
    })
}

const blog_search_get = async (req, res) => {
    const page = req.query.p || 1
    const searchTerm = req.query.q
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, " ")

    const matchCount = await Blog.find({
            $text: { $search: searchNoSpecialChar }
        }).count({})
          
    Blog.find({
        status: "published",
        $or: [
            { title: { $regex: searchNoSpecialChar, $options: "i" } },
            { snippet: { $regex: searchNoSpecialChar, $options: "i" } }
        ],
            $text: { $search: searchNoSpecialChar }
        },
        { score: { $meta: "textScore" } 
    })
    .sort({ score: { $meta: "textScore" }, posts: -1 })
    .skip(page * perPage - perPage)
    .limit(perPage)
    .then((blogs) => {
        blogs.forEach(async (blog) => {
            blog.timestamp = dateFns.formatDistanceToNow(new Date(blog.updatedAt), { addSuffix: true })
        })

        const pageCount = Math.ceil(matchCount / perPage);
        const nextPage = parseInt(page) + 1;
        const prevPage = parseInt(page) - 1;
        const hasNextPage = nextPage <= pageCount;
        const hasPrevPage = prevPage >= 1;

        res.render("./blogs/search", { 
            title: "Search Results", 
            blogs, 
            currentPage: page,
            nextPage: hasNextPage ? nextPage : null,
            prevPage: hasPrevPage ? prevPage : null,
            searchTerm,
            matchCount,
            tab : null,
            res: {
                user : req.user,
            }
        })
    })
    .catch((err) => {
        res.status(404).render("404", { title: "404" })
        console.log(err)
    })
}

const user_search_get = async (req, res) => {
    const page = req.query.p || 1
    const searchTerm = req.query.q
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, " ")

    const matchCount = await User.find({
            $text: { $search: searchNoSpecialChar }
        }).count({})
          
    User.find({
        $or: [
            { fullName: { $regex: searchNoSpecialChar, $options: "i" } },
            { username: { $regex: searchNoSpecialChar, $options: "i" } }
        ],
            $text: { $search: searchNoSpecialChar }
        },
        { score: { $meta: "textScore" } 
    })
    .sort({ score: { $meta: "textScore" }, posts: -1 })
    .skip(page * perPage - perPage)
    .limit(perPage)
    .then((users) => {
        const pageCount = Math.ceil(matchCount / perPage);
        const nextPage = parseInt(page) + 1;
        const prevPage = parseInt(page) - 1;
        const hasNextPage = nextPage <= pageCount;
        const hasPrevPage = prevPage >= 1;

        res.render("./blogs/search", { 
            title: "Search Results", 
            users, 
            currentPage: page,
            nextPage: hasNextPage ? nextPage : null,
            prevPage: hasPrevPage ? prevPage : null,
            searchTerm,
            matchCount,
            tab : "users",
            res: {
                user : req.user,
            }
        })
    })
    .catch((err) => {
        res.status(404).render("404", { title: "404" })
        console.log(err)
    })
}

const blog_signin_get = (req, res) => {
    if( req.user ){
        res.redirect("/blogs/")
        return
    }
    res.render("./auths/signin", { 
        title: "Sign In", 
        error: { message : null },
        res: {
            user : req.user,
        }
    })
}

const blog_signup_get = (req, res) => {
    if( req.user ){
        res.redirect("/blogs/")
        return
    }
    res.render("./auths/signup", { 
        title: "Sign Up", 
        error: { message : null },
        res: {
            user : req.user,
        }
     })
}


export {
    blog_index,
    blog_about_get,
    blog_post,
    blog_create_get,
    blog_create_post,
    blog_delete,
    blog_edit_get,
    blog_edit_post,
    blog_search_get,
    user_search_get,
    blog_signin_get,
    blog_signup_get,
}