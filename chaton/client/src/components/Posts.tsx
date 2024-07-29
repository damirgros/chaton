import React from "react";
import { PostsProps } from "../types/types";

const Posts: React.FC<PostsProps> = ({ posts, currentUser }) => (
  <div className="posts">
    {posts
      .filter((post) => post.author.id !== currentUser)
      .map((post) => (
        <div key={post.id} className="post">
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          <small>Posted by: {post.author.username}</small>
          <br />
          <small>Posted on: {new Date(post.createdAt).toLocaleString()}</small>
        </div>
      ))}
  </div>
);

export default Posts;
