import React, { useEffect, useState } from "react";
import axios from "axios";
import { Post, FollowersPostsProps } from "../../types/types";
import gravatar from "gravatar";
import styles from "./FollowersPosts.module.css";
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
    <div className={styles.followersPosts}>
      {posts.length > 0 ? (
        posts.map((post) => {
          const profilePicture =
            post.author?.profilePicture ||
            gravatar.url(post.author?.email, { s: "50", d: "retro" }, true);
          return (
            <div key={post.id} className={styles.post}>
              <div className={styles.postHeader}>
                <img
                  src={profilePicture}
                  alt={post.author?.username || "Profile"}
                  className={styles.profilePicture}
                />
                <div className={styles.postAuthorInfo}>
                  <strong>{post.author?.username || "Unknown User"}</strong>
                </div>
              </div>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              <div className={styles.postFooter}>
                <small>Posted on: {new Date(post.createdAt).toLocaleString()}</small>
                <button
                  onClick={() => toggleComments(post.id)}
                  className={styles.commentToggleButton}
                >
                  {showComments[post.id] ? "Hide Comments" : "Show Comments"}
                </button>
              </div>
              {showComments[post.id] && (
                <>
                  <div className={styles.comments}>
                    {postComments[post.id]?.map((comment) => {
                      const commentProfilePicture =
                        comment.author?.profilePicture ||
                        gravatar.url(comment.author?.email, { s: "50", d: "retro" }, true);
                      return (
                        <div key={comment.id} className={styles.comment}>
                          <div className={styles.commentHeader}>
                            <img
                              src={commentProfilePicture}
                              alt={comment.author?.username || "Profile"}
                              className={styles.profilePicture}
                            />
                            <div className={styles.commentAuthorInfo}>
                              <strong>{comment.author?.username || "Unknown User"}</strong>
                            </div>
                          </div>
                          <div className={styles.commentBody}>
                            <p>{comment.content}</p>
                            <div className={styles.commentFooter}>
                              <small>
                                Commented on: {new Date(comment.createdAt).toLocaleString()}
                              </small>
                              {comment.author?.id === currentUser?.id && (
                                <>
                                  {editingCommentId === comment.id ? (
                                    <div className={styles.editCommentForm}>
                                      <textarea
                                        value={editCommentContent}
                                        onChange={(e) => setEditCommentContent(e.target.value)}
                                        className={styles.editCommentInput}
                                      />
                                      <button
                                        onClick={() => handleEditComment(post.id, comment.id)}
                                        className={styles.updateButton}
                                      >
                                        Save
                                      </button>
                                      <button onClick={cancelEdit} className={styles.cancelButton}>
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() =>
                                          handleEditButtonClick(comment.id, comment.content)
                                        }
                                        className={styles.editButton}
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteComment(comment.id, post.id)}
                                        className={styles.deleteButton}
                                      >
                                        Delete
                                      </button>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {currentUser && (
                    <div className={styles.addComment}>
                      <textarea
                        placeholder="Add a comment"
                        value={newCommentContent[post.id] || ""}
                        onChange={(e) =>
                          setNewCommentContent((prevContent) => ({
                            ...prevContent,
                            [post.id]: e.target.value,
                          }))
                        }
                        className={styles.addCommentInput}
                      />
                      <button
                        onClick={() => handleAddComment(post.id, newCommentContent[post.id])}
                        className={styles.addCommentButton}
                      >
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
