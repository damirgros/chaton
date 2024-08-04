import express from "express";
import {
  createComment,
  fetchComments,
  deleteComment,
  updateComment,
} from "../controllers/commentController.js";
import { ensureAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.post("/:postId/comments", ensureAuthenticated, createComment);
router.get("/:postId/comments", fetchComments);
router.delete("/:commentId", ensureAuthenticated, deleteComment);
router.put("/:commentId", ensureAuthenticated, updateComment);

export default router;
