import React, { useState } from "react";
import axios from "axios";
import { Post, CreatePostProps } from "../types/types";

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
    <div className="create-post">
      <h2>Create a Post</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          required
        />
        <br />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post here..."
          required
        />
        <br />
        <button type="submit">Create Post</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default CreatePost;
