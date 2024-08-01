import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, receivedMessages: true },
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
