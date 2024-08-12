import React, { useEffect, useState } from "react";
import { CommunityPostsProps } from "../../types/types";
import gravatar from "gravatar";
import styles from "./CommunityPosts.module.css";
import { useComments } from "../../customHooks/useComments";

const CommunityPosts: React.FC<CommunityPostsProps> = ({ posts, currentUser }) => {
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [commentContent, setCommentContent] = useState<string>("");
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
    const loadComments = async () => {
      for (const post of posts) {
        if (showComments[post.id]) {
          await fetchComments(post.id);
        }
      }
    };

    loadComments();
  }, [posts, showComments, fetchComments]);

  const toggleComments = (postId: string) => {
    setShowComments((prev) => {
      const newShowComments = { ...prev, [postId]: !prev[postId] };
      if (!prev[postId]) {
        fetchComments(postId);
      }
      return newShowComments;
    });
  };

  return (
    <div className={styles.posts}>
      {posts.length > 0 ? (
        posts
          .filter((post) => post.author.id !== currentUser?.id)
          .map((post) => {
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
                    <strong className={styles.postAuthorName}>
                      {post.author?.username || "Unknown User"}
                    </strong>
                  </div>
                </div>
                <div className={styles.postBody}>
                  <h3 className={styles.postTitle}>{post.title}</h3>
                  <p className={styles.postContent}>{post.content}</p>
                  <small className={styles.postDate}>
                    Posted on: {new Date(post.createdAt).toLocaleString()}
                  </small>
                  <button
                    onClick={() => toggleComments(post.id)}
                    className={styles.commentToggleButton}
                  >
                    {showComments[post.id] ? "Hide Comments" : "Show Comments"}
                  </button>
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
                                  <strong className={styles.commentAuthorName}>
                                    {comment.author?.username || "Unknown User"}
                                  </strong>
                                </div>
                              </div>
                              <div className={styles.commentBody}>
                                <p className={styles.commentContent}>{comment.content}</p>
                                <div className={styles.commentActions}>
                                  <small className={styles.commentDate}>
                                    Commented on: {new Date(comment.createdAt).toLocaleString()}
                                  </small>
                                  {comment.author?.id === currentUser?.id && (
                                    <>
                                      {editingCommentId === comment.id ? (
                                        <div className={styles.editComment}>
                                          <textarea
                                            value={editCommentContent}
                                            onChange={(e) => setEditCommentContent(e.target.value)}
                                            placeholder="Edit your comment"
                                            className={styles.editCommentInput}
                                            id="content"
                                            name="content"
                                          />
                                          <button
                                            onClick={() => handleEditComment(post.id, comment.id)}
                                            className={styles.updateButton}
                                          >
                                            Save
                                          </button>
                                          <button
                                            onClick={cancelEdit}
                                            className={styles.cancelButton}
                                          >
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
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            className={styles.addCommentInput}
                            id="content"
                            name="content"
                          />
                          <button
                            onClick={() => handleAddComment(post.id, commentContent)}
                            className={styles.addCommentButton}
                          >
                            Comment
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
      ) : (
        <p>
          <p>No posts from community yet.</p>
        </p>
      )}
    </div>
  );
};

export default CommunityPosts;
