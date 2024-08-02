import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createPost = async (req, res) => {
  const { title, content } = req.body;
  const userId = req.user.id;

  try {
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: userId,
      },
    });

    res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const fetchPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: { username: true, id: true }, // Include only necessary fields
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deletePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.authorId !== userId && userId !== "guest") {
      return res.status(403).json({ message: "Unauthorized to delete this post" });
    }

    await prisma.post.delete({ where: { id: postId } });
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePost = async (req, res) => {
  const { postId } = req.params;
  const { title, content } = req.body;
  const userId = req.user.id;

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.authorId !== userId && userId !== "guest") {
      return res.status(403).json({ message: "Unauthorized to update this post" });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { title, content },
    });

    res.json({ message: "Post updated successfully", post: updatedPost });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
