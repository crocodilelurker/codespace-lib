import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/",(req,res)=>{
    return res.status(200).json({message:"Hello World from github codespaces"});
})

app.listen(PORT,()=>{
    console.log("server running on port " + PORT);
})