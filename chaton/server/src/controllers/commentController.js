import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createComment = async (req, res) => {
  const { content } = req.body;
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: userId,
        postId,
      },
      include: {
        author: {
          select: { username: true, id: true, profilePicture: true, email: true },
        },
      },
    });

    res.status(201).json({ message: "Comment created successfully", comment });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const fetchComments = async (req, res) => {
  const { postId } = req.params;

  try {
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: { username: true, id: true, profilePicture: true, email: true }, // Include only necessary fields
        },
      },
      orderBy: { createdAt: "asc" },
    });

    res.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  try {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.authorId !== userId && userId !== "guest") {
      return res.status(403).json({ message: "Unauthorized to delete this comment" });
    }

    await prisma.comment.delete({ where: { id: commentId } });
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user?.id; // Ensure the user ID is properly fetched

  try {
    // Fetch the comment to update
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check authorization
    if (comment.authorId !== userId && userId !== "guest") {
      return res.status(403).json({ message: "Unauthorized to update this comment" });
    }

    // Update the comment
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
    });

    // Fetch the user information based on the authorId of the updated comment
    const user = await prisma.user.findUnique({
      where: { id: updatedComment.authorId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the updated comment and user information in the response
    res.json({
      message: "Comment updated successfully",
      comment: {
        ...updatedComment,
        author: {
          id: user.id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture, // Include additional user information if needed
        },
      },
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
