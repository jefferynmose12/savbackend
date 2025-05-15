import express from "express";
import { getUserInfo, testEndpoint } from "../controllers/user.js";

const router = express.Router();

router.get("/user", getUserInfo);
router.get("/test", testEndpoint);

export default router;
