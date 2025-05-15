import express from "express";
import { sendMessage, getMessages } from "../controllers/conversation.js";

const router = express.Router();

router.post("/send-message", sendMessage);
router.get("/messages", getMessages);

export default router;
