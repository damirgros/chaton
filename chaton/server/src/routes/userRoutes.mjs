import express from "express";
import { getUserById } from "../controllers/userController.js";

const router = express.Router();

router.get("/:userId", getUserById);

export default router;
