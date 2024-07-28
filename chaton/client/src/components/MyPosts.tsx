import React from "react";
import CreatePost from "./CreatePost";
import axios from "axios";

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

interface MyPostsProps {
  posts: Post[];
  currentUser: string | null;
  onPostCreated: (newPost: Post) => void;
  onDelete: (postId: string) => void;
  editingPost: Post | null;
  setEditingPost: React.Dispatch<React.SetStateAction<Post | null>>;
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
}

const MyPosts: React.FC<MyPostsProps> = ({
  posts,
  currentUser,
  onPostCreated,
  onDelete,
  editingPost,
  setEditingPost,
  setPosts,
}) => {
  if (!currentUser) {
    return <p>Error: User not logged in.</p>;
  }

  const myPosts = posts.filter((post) => post.author?.id === currentUser);

  const handleDelete = async (postId: string) => {
    try {
      await axios.delete(`/api/posts/${postId}`);
      onDelete(postId);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleSaveEdit = async () => {
    if (editingPost) {
      try {
        // Optimistically update UI
        setPosts((prevPosts) =>
          prevPosts.map((post) => (post.id === editingPost.id ? { ...post, ...editingPost } : post))
        );

        // Update the post on the server
        const response = await axios.put(`/api/posts/${editingPost.id}`, {
          title: editingPost.title,
          content: editingPost.content,
        });

        // Update the local state with the updated post
        setPosts((prevPosts) =>
          prevPosts.map((post) => (post.id === editingPost.id ? response.data : post))
        );
        setEditingPost(null);
      } catch (error) {
        console.error("Error updating post:", error);
      }
    }
  };

  return (
    <div className="my-posts">
      <CreatePost userId={currentUser} onPostCreated={onPostCreated} />
      {myPosts.length === 0 ? (
        <p>No posts available</p>
      ) : (
        myPosts.map((post) => (
          <div key={post.id} className="post">
            {editingPost?.id === post.id ? (
              <div>
                <input
                  type="text"
                  value={editingPost.title}
                  onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                />
                <textarea
                  value={editingPost.content}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                />
                <button onClick={handleSaveEdit}>Save</button>
                <button onClick={() => setEditingPost(null)}>Cancel</button>
              </div>
            ) : (
              <>
                <h3>{post.title}</h3>
                <p>{post.content}</p>
                <button onClick={() => setEditingPost(post)}>Edit</button>
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
