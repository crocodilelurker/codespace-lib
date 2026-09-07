import "dotenv/config";

import express from "express";

import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import documentRoutes from "./routes/document.routes.js";
import accessRoutes from "./routes/access.routes.js";
// import rclient from "./config/redis.js";
import connectDb from "./config/db.js";
const app = express();
const PORT = process.env.PORT || 8001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

connectDb();

app.use("/api/auth", authRoutes);
app.use("/api/document", documentRoutes);
app.use("/api/access",accessRoutes);

app.get("/", (req, res) => {
    return res.status(200).json({ message: "Hello World from github codespaces" });
})

app.listen(PORT, () => {
    console.log("server running on port " + PORT);
})