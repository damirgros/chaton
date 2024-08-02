// routes/posts.js
import express from "express";
import { createPost, fetchPosts, deletePost, updatePost } from "../controllers/postController.js";
import { ensureAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.post("/", ensureAuthenticated, createPost);
router.get("/", fetchPosts);
router.delete("/:postId", ensureAuthenticated, deletePost);
router.put("/:postId", ensureAuthenticated, updatePost);

export default router;
