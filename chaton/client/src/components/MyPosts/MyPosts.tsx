import React, { useState } from "react";
import CreatePost from "../CreatePost/CreatePost";
import axios from "axios";
import { Post, MyPostsProps } from "../../types/types";
import gravatar from "gravatar";
import styles from "./MyPosts.module.css";

const MyPosts: React.FC<MyPostsProps> = ({
  posts,
  currentUser,
  onPostCreated,
  onDelete,
  editingPost,
  setEditingPost,
  setPosts,
}) => {
  const [editTitle, setEditTitle] = useState<string>("");
  const [editContent, setEditContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const myPosts = posts.filter((post) => post.author.id === currentUser.id);

  const handleDelete = async (postId: string) => {
    try {
      await axios.delete(`/api/posts/${postId}`, {
        headers: { "x-user-id": currentUser.id === "guest" ? "guest" : "" },
      });
      onDelete(postId);
      setError(null);
    } catch (err) {
      setError("Error deleting post.");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;

    try {
      await axios.put<{ post: Post }>(
        `/api/posts/${editingPost.id}`,
        {
          title: editTitle,
          content: editContent,
        },
        {
          headers: { "x-user-id": currentUser.id === "guest" ? "guest" : "" },
        }
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === editingPost.id ? { ...post, title: editTitle, content: editContent } : post
        )
      );
      setEditingPost(null);
      setError(null);
    } catch (err) {
      setError("Error updating post.");
    }
  };

  return (
    <div className={styles.myPosts}>
      <CreatePost currentUser={currentUser} onPostCreated={onPostCreated} />
      {error && <p className={styles.error}>{error}</p>}
      {myPosts.length === 0 ? (
        <p>No posts available</p>
      ) : (
        myPosts.map((post) => (
          <div key={post.id} className={styles.post}>
            <div className={styles.postHeader}>
              <img
                src={
                  currentUser.profilePicture
                    ? currentUser.profilePicture
                    : gravatar.url(currentUser.username, { s: "50", d: "retro" }, true)
                }
                alt={currentUser.username}
                className={styles.profilePicture}
              />
              <div className={styles.postAuthorInfo}>
                <strong>{post.author.username}</strong>
              </div>
            </div>
            {editingPost?.id === post.id ? (
              <div className={styles.editPostForm}>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Post Title"
                  className={styles.editInput}
                />
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Post Content"
                  className={styles.editTextarea}
                />
                <button onClick={handleSaveEdit} className={styles.saveButton}>
                  Save
                </button>
                <button onClick={() => setEditingPost(null)} className={styles.cancelButton}>
                  Cancel
                </button>
              </div>
            ) : (
              <div className={styles.postContent}>
                <h3 className={styles.postTitle}>{post.title}</h3>
                <p>{post.content}</p>
                <div className={styles.postDateContainer}>
                  <small className={styles.postDate}>
                    Posted on: {new Date(post.createdAt).toLocaleString()}
                  </small>
                  <div className={styles.postActions}>
                    <button
                      onClick={() => {
                        setEditingPost(post);
                        setEditTitle(post.title);
                        setEditContent(post.content);
                      }}
                      className={styles.editButton}
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDelete(post.id)} className={styles.deleteButton}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default MyPosts;
