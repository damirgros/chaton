import React, { useEffect, useState } from "react";
import axios from "axios";
import { Post, FollowersPostsProps } from "../types/types";
import gravatar from "gravatar";
import "./FollowersPosts.css"; // Import the standard CSS file

const FollowersPosts: React.FC<FollowersPostsProps> = ({ userId, currentUser }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFollowersPosts = async () => {
      try {
        const response = await axios.get<{ posts: Post[] }>(`/api/user/${userId}/followers/posts`);
        setPosts(response.data.posts);
      } catch (err) {
        setError("Failed to fetch followers' posts");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchFollowersPosts();
    }
  }, [userId, currentUser]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="followers-posts">
      <h2>Followers' Posts</h2>
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post.id} className="post">
            <div className="post-header">
              <img
                src={
                  post.author.profilePicture
                    ? post.author.profilePicture
                    : gravatar.url(post.author.email, { s: "50", d: "retro" }, true)
                }
                alt={post.author.username}
                className="author-avatar"
              />
              <div className="post-author-info">
                <strong>{post.author.username}</strong>
              </div>
            </div>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <small>Posted on: {new Date(post.createdAt).toLocaleString()}</small>
          </div>
        ))
      ) : (
        <p>No posts from followers yet.</p>
      )}
    </div>
  );
};

export default FollowersPosts;
