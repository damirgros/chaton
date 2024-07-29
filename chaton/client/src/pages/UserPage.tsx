import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Posts from "../components/Posts";
import MyPosts from "../components/MyPosts";
import ChatComponent from "../components/Chat";
import Profile from "../components/Profile";
import { Post, User } from "../types/types";

const UserPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"posts" | "myPosts" | "chat" | "profile">(
    "posts"
  );
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, postsResponse] = await Promise.all([
          axios.get<{ user: User }>(`/api/user/${userId}`),
          axios.get<{ posts: Post[] }>(`/api/posts`),
        ]);

        setUser(userResponse.data.user);
        setPosts(postsResponse.data.posts);
      } catch (err) {
        setError("Failed to fetch data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handlePostCreated = (newPost: Post) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts(posts.filter((post) => post.id !== postId));
  };

  const handleLogout = async () => {
    try {
      await axios.get("/api/auth/logout");
      navigate("/");
    } catch (err) {
      console.error("Failed to log out", err);
      setError("Failed to log out");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="user-page">
      <h1>{user?.username}</h1>
      <button onClick={handleLogout}>Logout</button>
      <div className="tabs">
        <button onClick={() => setActiveSection("posts")}>Posts</button>
        <button onClick={() => setActiveSection("myPosts")}>My Posts</button>
        <button onClick={() => setActiveSection("chat")}>Chat</button>
        <button onClick={() => setActiveSection("profile")}>Profile</button>
      </div>

      {activeSection === "posts" && <Posts posts={posts} currentUser={user?.id || null} />}
      {activeSection === "myPosts" && user && (
        <MyPosts
          posts={posts}
          currentUser={user.id}
          username={user.username}
          onPostCreated={handlePostCreated}
          onDelete={handlePostDeleted}
          editingPost={editingPost}
          setEditingPost={setEditingPost}
          setPosts={setPosts}
        />
      )}
      {activeSection === "chat" && user && <ChatComponent userUsername={user.username} />}
      {activeSection === "profile" && user && <Profile user={user} />}
    </div>
  );
};

export default UserPage;
