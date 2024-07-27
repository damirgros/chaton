import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ChatComponent from "./ChatComponent";

interface User {
  id: number;
  username: string;
  email: string;
}

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setError("User ID is not available");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/user/${userId}`);
        setUser(response.data.user);
      } catch (err) {
        setError("Failed to fetch user data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

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
    <div className="user-profile">
      <h1>User Profile</h1>
      <p>User ID: {userId}</p>
      <div className="profile-info">
        <p>Username: {user?.username}</p>
        <p>Email: {user?.email}</p>
      </div>
      <div className="posts">
        <div className="post">Post 1</div>
        <div className="post">Post 2</div>
      </div>
      {user && user.username && (
        <div>
          <ChatComponent userUsername={user.username} />
        </div>
      )}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default UserProfile;
