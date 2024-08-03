import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { __dirname } from "../utils/dirname.js";

const prisma = new PrismaClient();

export const getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        receivedMessages: true,
        bio: true,
        location: true,
        profilePicture: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Fetch followed users
export const getFollowedUsers = async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        following: {
          include: {
            following: true, // Include followed user details
          },
        },
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Extract user details from follow relationships
    const followedUsers = user.following.map((follow) => follow.following);
    res.json({ users: followedUsers });
  } catch (error) {
    console.error("Error fetching followed users:", error);
    res.status(500).send("Server error");
  }
};

// Search users
export const searchUsers = async (req, res) => {
  const { searchTerm } = req.query;
  const userId = req.params.userId;
  try {
    if (!searchTerm) {
      return res.json({ users: [] }); // Return empty array if no searchTerm
    }
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: searchTerm,
          mode: "insensitive",
        },
        id: { not: userId },
      },
      take: 10,
    });
    res.json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).send("Server error");
  }
};

// Follow a user
export const followUser = async (req, res) => {
  const userId = req.params.userId;
  const { userIdToFollow } = req.body;

  console.log("Received follow request:", { userId, userIdToFollow });

  if (!userIdToFollow) {
    return res.status(400).send("userIdToFollow must be provided");
  }

  try {
    await prisma.follows.create({
      data: {
        followerId: userId,
        followingId: userIdToFollow,
      },
    });
    console.log("User followed successfully");
    res.status(200).send("User followed");
  } catch (error) {
    console.error("Error following user:", error);
    if (error.code === "P2002") {
      res.status(400).send("You are already following this user");
    } else {
      res.status(500).send("Server error");
    }
  }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
  const userId = req.params.userId;
  const { userIdToUnfollow } = req.body;

  if (!userIdToUnfollow) {
    return res.status(400).send("userIdToUnfollow must be provided");
  }

  try {
    await prisma.follows.delete({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: userIdToUnfollow,
        },
      },
    });
    res.status(200).send("User unfollowed");
  } catch (error) {
    console.error("Error unfollowing user:", error);

    if (error.code === "P2025") {
      res.status(404).send("Follow relationship not found");
    } else {
      res.status(500).send("Server error");
    }
  }
};

// Get recommended users
export const getRecommendedUsers = async (req, res) => {
  const userId = req.params.userId;

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { following: true },
    });

    if (!currentUser) {
      return res.status(404).send("User not found");
    }

    // Extract followed user IDs
    const followedUserIds = currentUser.following.map((user) => user.followingId);

    // Add the current user's ID to exclude themselves from recommendations
    followedUserIds.push(userId);

    // Fetch users not in the followed list
    const recommendedUsers = await prisma.user.findMany({
      where: {
        id: { notIn: followedUserIds },
      },
      take: 10,
      orderBy: { username: "asc" },
    });

    res.json({ users: recommendedUsers });
  } catch (error) {
    console.error("Error fetching recommended users:", error);
    res.status(500).send("Server error");
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  const { userId } = req.params;
  const { bio, location } = req.body;
  let profilePicture;

  try {
    // Handle profile picture if uploaded
    if (req.file) {
      profilePicture = `/uploads/${req.file.filename}`;

      // Fetch the current user
      const user = await prisma.user.findUnique({ where: { id: userId } });

      // Remove the old profile picture if it exists
      if (user && user.profilePicture) {
        const oldFilePath = path.join(__dirname, "..", user.profilePicture);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { bio, location, profilePicture },
    });

    res.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch user to get the profile picture path
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user.profilePicture) {
      // Remove the profile picture file if it exists
      fs.unlinkSync(path.join(__dirname, "..", user.profilePicture));
    }

    await prisma.user.delete({ where: { id: userId } });
    res.status(200).send({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get posts from users followers
export const getFollowersPosts = async (req, res) => {
  const getFollowers = async (userId) => {
    try {
      const followers = await prisma.follows.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });
      return followers.map((follow) => follow.followingId);
    } catch (error) {
      throw new Error("Error fetching followers");
    }
  };
  try {
    const userId = req.params.userId;
    const followers = await getFollowers(userId);
    const posts = await prisma.post.findMany({
      where: { authorId: { in: followers } },
      include: { author: true },
    });
    res.json({ posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch followers' posts" });
  }
};
