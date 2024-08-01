import express from "express";
import {
  followUser,
  getFollowedUsers,
  getRecommendedUsers,
  getUserById,
  searchUsers,
  unfollowUser,
} from "../controllers/userController.js";
import { ensureAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.get("/:userId", getUserById);
router.get("/:userId/followed", ensureAuthenticated, getFollowedUsers);
router.get("/:userId/search", ensureAuthenticated, searchUsers);
router.post("/:userId/follow", ensureAuthenticated, followUser);
router.post("/:userId/unfollow", ensureAuthenticated, unfollowUser);
router.get("/:userId/recommended", ensureAuthenticated, getRecommendedUsers);

export default router;
