import React, { useState } from "react";
import axios from "axios";
import { Post, CreatePostProps } from "../../types/types";
import styles from "./CreatePost.module.css";
import gravatar from "gravatar";

const CreatePost: React.FC<CreatePostProps> = ({ currentUser, onPostCreated }) => {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newPost: Post = {
      id: "",
      title,
      content,
      createdAt: new Date().toISOString(),
      author: {
        id: currentUser.id,
        username: currentUser.username,
        profilePicture:
          currentUser.profilePicture ||
          gravatar.url(currentUser.username, { s: "50", d: "retro" }, true),
      },
    };

    try {
      const response = await axios.post<{ message: string; post: Post }>(
        "/api/posts",
        {
          title,
          content,
          userId: currentUser.id,
        },
        {
          headers: { "x-user-id": currentUser.id === "guest" ? "guest" : "" },
        }
      );

      onPostCreated({ ...newPost, id: response.data.post.id });

      setTitle("");
      setContent("");
      setError(null);
    } catch (err) {
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
