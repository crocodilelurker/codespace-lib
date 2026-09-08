import "dotenv/config";

import cors from "cors";
import express from "express";
import http from "http";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import documentRoutes from "./routes/document.routes.js";
import accessRoutes from "./routes/access.routes.js";
// import rclient from "./config/redis.js";
import connectDb from "./config/db.js";
import { initWebSocket } from "./websocket.js";
const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: true,
    credentials: true
}));

connectDb();

app.use("/api/auth", authRoutes);
app.use("/api/document", documentRoutes);
app.use("/api/access", accessRoutes);

app.get("/", (req, res) => {
    return res.status(200).json({ message: "Hello World from github codespaces" });
})
const server = http.createServer(app);
const wss = await initWebSocket(server);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})