import express from "express";
import multer from "multer";
import {
  followUser,
  getFollowedUsers,
  getRecommendedUsers,
  getUserById,
  searchUsers,
  unfollowUser,
  updateUserProfile,
  deleteUser,
  getFollowersPosts,
} from "../controllers/userController.js";
import { ensureAuthenticated } from "../middleware/auth.js";
import path from "path";
import { __dirname } from "../utils/dirname.js";

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.get("/:userId", ensureAuthenticated, getUserById);
router.get("/:userId/followed", ensureAuthenticated, getFollowedUsers);
router.get("/:userId/search", ensureAuthenticated, searchUsers);
router.post("/:userId/follow", ensureAuthenticated, followUser);
router.post("/:userId/unfollow", ensureAuthenticated, unfollowUser);
router.get("/:userId/followers/posts", getFollowersPosts);
router.get("/:userId/recommended", ensureAuthenticated, getRecommendedUsers);
router.put(
  "/:userId/profile",
  ensureAuthenticated,
  upload.single("profilePicture"),
  updateUserProfile
);
router.delete("/:userId", ensureAuthenticated, deleteUser);

export default router;
