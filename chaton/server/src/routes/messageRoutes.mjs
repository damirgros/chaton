import express from "express";
import { fetchMessages, sendMessage } from "../controllers/messageController.js";

const router = express.Router();

router.get("/:username", fetchMessages);
router.post("/send", sendMessage);

export default router;
