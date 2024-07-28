import React, { useState } from "react";
import axios from "axios";

interface CreatePostProps {
  userId: string;
  onPostCreated: (post: Post) => void;
}

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
  };
}

const CreatePost: React.FC<CreatePostProps> = ({ userId, onPostCreated }) => {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await axios.post<{ message: string; post: Post }>("/api/posts", {
        title,
        content,
        userId,
      });
      onPostCreated(response.data.post);
      setTitle("");
      setContent("");
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
