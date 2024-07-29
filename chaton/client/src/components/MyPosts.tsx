import React, { useState } from "react";
import CreatePost from "./CreatePost";
import axios from "axios";
import { Post, MyPostsProps } from "../types/types";

const MyPosts: React.FC<MyPostsProps> = ({
  posts,
  currentUser,
  onPostCreated,
  onDelete,
  editingPost,
  setEditingPost,
  setPosts,
  username,
}) => {
  const [editTitle, setEditTitle] = useState<string>("");
  const [editContent, setEditContent] = useState<string>("");

  const myPosts = posts.filter((post) => post.author.id === currentUser);

  const handleDelete = (postId: string) => {
    axios
      .delete(`/api/posts/${postId}`)
      .then(() => {
        onDelete(postId);
      })
      .catch((error) => {
        console.error("Error deleting post:", error);
      });
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;

    // Optimistically update the UI
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === editingPost.id ? { ...post, title: editTitle, content: editContent } : post
      )
    );

    // Clear the editing state
    setEditingPost(null);

    try {
      // Update the post in the database
      await axios.put<{ post: Post }>(`/api/posts/${editingPost.id}`, {
        title: editTitle,
        content: editContent,
      });
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Issue with the database. Try again, please.");
    }
  };

  return (
    <div className="my-posts">
      <CreatePost userId={currentUser} username={username} onPostCreated={onPostCreated} />
      {myPosts.length === 0 ? (
        <p>No posts available</p>
      ) : (
        myPosts.map((post) => (
          <div key={post.id} className="post">
            {editingPost?.id === post.id ? (
              <div>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                <button onClick={handleSaveEdit}>Save</button>
                <button onClick={() => setEditingPost(null)}>Cancel</button>
              </div>
            ) : (
              <>
                <h3>{post.title}</h3>
                <p>{post.content}</p>
                <button
                  onClick={() => {
                    setEditingPost(post);
                    setEditTitle(post.title);
                    setEditContent(post.content);
                  }}
                >
                  Edit
                </button>
                <button onClick={() => handleDelete(post.id)}>Delete</button>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default MyPosts;
