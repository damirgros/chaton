import React, { useEffect, useState } from "react";
import { CommunityPostsProps } from "../../types/types";
import gravatar from "gravatar";
import "./CommunityPosts.css";
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
    <div className="posts">
      {posts
        .filter((post) => post.author.id !== currentUser?.id)
        .map((post) => {
          const profilePicture =
            post.author?.profilePicture ||
            gravatar.url(post.author?.email, { s: "50", d: "retro" }, true);
          return (
            <div key={post.id} className="post">
              <div className="post-header">
                <img
                  src={profilePicture}
                  alt={post.author?.username || "Profile"}
                  className="profile-picture"
                />
                <div className="post-author-info">
                  <strong className="post-author-name">
                    {post.author?.username || "Unknown User"}
                  </strong>
                </div>
              </div>
              <div className="post-body">
                <h3 className="post-title">{post.title}</h3>
                <p className="post-content">{post.content}</p>
                <small className="post-date">
                  Posted on: {new Date(post.createdAt).toLocaleString()}
                </small>
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
                                className="profile-picture"
                              />
                              <div className="comment-author-info">
                                <strong className="comment-author-name">
                                  {comment.author?.username || "Unknown User"}
                                </strong>
                                {comment.author?.id === currentUser?.id && (
                                  <>
                                    {editingCommentId === comment.id ? (
                                      <div className="edit-comment">
                                        <input
                                          type="text"
                                          value={editCommentContent}
                                          onChange={(e) => setEditCommentContent(e.target.value)}
                                          placeholder="Edit your comment"
                                        />
                                        <button
                                          onClick={() => handleEditComment(post.id, comment.id)}
                                          className="update-button"
                                        >
                                          Save
                                        </button>
                                        <button onClick={cancelEdit} className="cancel-button">
                                          Cancel
                                        </button>
                                      </div>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() =>
                                            handleEditButtonClick(comment.id, comment.content)
                                          }
                                          className="edit-button"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => handleDeleteComment(comment.id, post.id)}
                                          className="delete-button"
                                        >
                                          Delete
                                        </button>
                                      </>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="comment-body">
                              <p className="comment-content">{comment.content}</p>
                              <small className="comment-date">
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
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                        />
                        <button onClick={() => handleAddComment(post.id, commentContent)}>
                          Comment
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default CommunityPosts;
