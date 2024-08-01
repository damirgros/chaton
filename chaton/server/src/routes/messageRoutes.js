import express from "express";
import {
  fetchMessages,
  sendMessage,
  getUsersWithMessageHistory,
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/usersWithHistory/:username", getUsersWithMessageHistory); // New route
router.get("/messages/:username1/:username2", fetchMessages); // Adjusted route
router.post("/messages/send", sendMessage);

export default router;
