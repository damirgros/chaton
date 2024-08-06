import React, { useState } from "react";
import axios from "axios";
import { Post, CreatePostProps } from "../types/types";
import styles from "./CreatePost.module.css";

const CreatePost: React.FC<CreatePostProps> = ({ userId, onPostCreated, username }) => {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Create the new post object
    const newPost: Post = {
      id: "", // This will be replaced by the server response
      title,
      content,
      createdAt: new Date().toISOString(),
      author: {
        id: userId,
        username,
      },
    };

    try {
      const response = await axios.post<{ message: string; post: Post }>(
        "/api/posts",
        {
          title,
          content,
          userId,
        },
        {
          headers: { "x-user-id": userId === "guest" ? "guest" : "" },
        }
      );

      // Update the parent component with the new post
      onPostCreated({ ...newPost, id: response.data.post.id });

      // Clear the form fields
      setTitle("");
      setContent("");
      setError(null);
    } catch (err) {
      console.error("Failed to create post:", err);
      setError("Failed to create post");
    }
  };

  return (
    <div className={styles.createPost}>
      <h2 className={styles.postTitle}>Create a Post</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <input
            className={styles.input}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            required
          />
        </div>
        <div>
          <textarea
            className={styles.input}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post here..."
            required
          />
        </div>
        <div className={styles.buttonBox}>
          <button className={styles.buttonCreatePost} type="submit">
            Create Post
          </button>
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </form>
    </div>
  );
};

export default CreatePost;
