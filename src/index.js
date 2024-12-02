import app from "./app.js"
import connectDB from "./db/index.js"

connectDB()
.then(() => {
    const PORT = process.env.PORT || 8888
    app.listen(PORT, () => {
        console.log(`🚀 Connected & Server is running on http://localhost:${PORT}`);
    })
})
.catch((err) => {
    console.log("MonoDB Connection Error: ", err);
    return
})