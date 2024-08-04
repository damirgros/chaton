import React, { useEffect, useState } from "react";
import axios from "axios";
import { Post, FollowersPostsProps } from "../../types/types";
import gravatar from "gravatar";
import "./FollowersPosts.css";
import { useComments } from "../../customHooks/useComments";

const FollowersPosts: React.FC<FollowersPostsProps> = ({ userId, currentUser }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newCommentContent, setNewCommentContent] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const {
    postComments,
    editingCommentId,
    editCommentContent,
    fetchComments,
    handleAddComment,
    handleDeleteComment,
    handleEditComment,
    handleEditButtonClick,
    cancelEdit,
    setEditCommentContent,
  } = useComments();

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

  const toggleComments = async (postId: string) => {
    if (!postComments[postId]) {
      await fetchComments(postId);
    }
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  useEffect(() => {
    const refreshComments = async () => {
      for (const post of posts) {
        if (!postComments[post.id]) {
          await fetchComments(post.id);
        }
      }
    };
    refreshComments();
  }, [posts, fetchComments, postComments]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="followers-posts">
      <h2>Followers' Posts</h2>
      {posts.length > 0 ? (
        posts.map((post) => {
          const profilePicture =
            post.author?.profilePicture ||
            gravatar.url(post.author?.email, { s: "50", d: "retro" }, true);
          return (
            <div key={post.id} className="post">
              <div className="post-header">
                <img
                  src={profilePicture}
                  alt={post.author?.username || "Profile"}
                  className="author-avatar"
                />
                <div className="post-author-info">
                  <strong>{post.author?.username || "Unknown User"}</strong>
                </div>
              </div>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              <small>Posted on: {new Date(post.createdAt).toLocaleString()}</small>
              <button onClick={() => toggleComments(post.id)} className="comment-toggle-button">
                {showComments[post.id] ? "Hide Comments" : "Show Comments"}
              </button>
              {showComments[post.id] && (
                <>
                  <div className="comments">
                    {postComments[post.id]?.map((comment) => {
                      const commentProfilePicture =
                        comment.author?.profilePicture ||
                        gravatar.url(comment.author?.email, { s: "50", d: "retro" }, true);
                      return (
                        <div key={comment.id} className="comment">
                          <div className="comment-header">
                            <img
                              src={commentProfilePicture}
                              alt={comment.author?.username || "Profile"}
                              className="author-avatar"
                            />
                            <div className="comment-author-info">
                              <strong>{comment.author?.username || "Unknown User"}</strong>
                              {comment.author?.id === currentUser?.id && (
                                <>
                                  {editingCommentId === comment.id ? (
                                    <div className="edit-comment">
                                      <input
                                        type="text"
                                        value={editCommentContent}
                                        onChange={(e) => setEditCommentContent(e.target.value)}
                                      />
                                      <button
                                        onClick={() => handleEditComment(post.id, comment.id)}
                                      >
                                        Save
                                      </button>
                                      <button onClick={cancelEdit}>Cancel</button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        handleEditButtonClick(comment.id, comment.content)
                                      }
                                      className="edit-button"
                                    >
                                      Edit
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteComment(comment.id, post.id)}
                                    className="delete-button"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="comment-body">
                            <p>{comment.content}</p>
                            <small>
                              Commented on: {new Date(comment.createdAt).toLocaleString()}
                            </small>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {currentUser && (
                    <div className="add-comment">
                      <input
                        type="text"
                        placeholder="Add a comment"
                        value={newCommentContent[post.id] || ""}
                        onChange={(e) =>
                          setNewCommentContent((prevContent) => ({
                            ...prevContent,
                            [post.id]: e.target.value,
                          }))
                        }
                      />
                      <button onClick={() => handleAddComment(post.id, newCommentContent[post.id])}>
                        Comment
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })
      ) : (
        <p>No posts from followers yet.</p>
      )}
    </div>
  );
};

export default FollowersPosts;
