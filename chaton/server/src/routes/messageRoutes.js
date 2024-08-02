import express from "express";
import { fetchMessages, getUsersWithMessageHistory } from "../controllers/messageController.js";

const router = express.Router();

router.get("/:username1/:username2", fetchMessages);
router.get("/usersWithHistory/:username", getUsersWithMessageHistory);

export default router;
