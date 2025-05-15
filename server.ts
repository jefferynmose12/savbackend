import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import connectDB from "./db.js";
import userRoutes from './routes/user.js'
import conversationRoutes from './routes/conversation.js'

dotenv.config();

const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "https://savclient-jefferynmose12s-projects.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(bodyParser.json());
connectDB();

app.use("/", userRoutes);
app.use("/",conversationRoutes);

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
