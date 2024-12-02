import "dotenv/config"
import express from "express"
import morgan from "morgan"
import session from "express-session"
import cookieParser from "cookie-parser"
import MongoStore from "connect-mongo"
import { DB_NAME } from "./constants.js"
import expressLayouts from "express-ejs-layouts"

const app = express()

/* middleware */
app.use(morgan("dev"))
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true })) // parse url-encoded data
app.use(express.json()) // parse json data
app.use(cookieParser())

/* session middleware */
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.DB_URI,
        dbName: DB_NAME,
        collectionName: "sessions"
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // -> 1 day
    }
}))

/* view engine */
app.use(expressLayouts)
app.set('view engine', 'ejs')
app.set('views', './views')
app.set('layout', './layouts/main')



/* routes */
import homeRoutes from "./routes/home.routes.js";
app.use('/', homeRoutes)

import userRoutes from "./routes/user.routes.js";
app.use('/users', userRoutes)

import blogRoutes from "./routes/blog.routes.js";
app.use('/blogs', blogRoutes)

import healthCheckRoutes from "./routes/heathcheck.routes.js";
app.use('/api/heathcheck', healthCheckRoutes);

app.use((req, res) => {
    res.status(404).render("404", { title: "404" })
})

export default app