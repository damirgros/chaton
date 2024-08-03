import React from "react";
import { CommunityPostsProps } from "../types/types";
import gravatar from "gravatar";
import "./CommunityPosts.css"; // Import the CSS file

const CommunityPosts: React.FC<CommunityPostsProps> = ({ posts, currentUser }) => (
  <div className="posts">
    {posts
      .filter((post) => post.author.id !== currentUser)
      .map((post) => (
        <div key={post.id} className="post">
          <div className="post-header">
            <img
              src={
                post.author.profilePicture
                  ? post.author.profilePicture
                  : gravatar.url(post.author.email, { s: "50", d: "retro" }, true)
              }
              alt={post.author.username}
              className="profile-picture"
            />
            <div className="post-author-info">
              <strong className="post-author-name">{post.author.username}</strong>
            </div>
          </div>
          <div className="post-body">
            <h3 className="post-title">{post.title}</h3>
            <p className="post-content">{post.content}</p>
            <small className="post-date">
              Posted on: {new Date(post.createdAt).toLocaleString()}
            </small>
          </div>
        </div>
      ))}
  </div>
);

export default CommunityPosts;
