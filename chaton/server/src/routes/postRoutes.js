import express from "express";
import {
  createPost,
  fetchPosts,
  deletePost,
  updatePost,
  createComment,
  fetchComments,
  deleteComment,
  updateComment,
} from "../controllers/postController.js";
import { ensureAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.post("/", ensureAuthenticated, createPost);
router.get("/", fetchPosts);
router.delete("/:postId", ensureAuthenticated, deletePost);
router.put("/:postId", ensureAuthenticated, updatePost);
router.post("/:postId/comments", ensureAuthenticated, createComment);
router.get("/:postId/comments", fetchComments);
router.delete("/:commentId", ensureAuthenticated, deleteComment);
router.put("/:commentId", ensureAuthenticated, updateComment);

export default router;
