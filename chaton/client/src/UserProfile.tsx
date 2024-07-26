import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

interface User {
  id: number;
  username: string;
  email: string;
}

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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
        console.error(err); // Log error to console
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleLogout = async () => {
    try {
      await axios.get("/api/auth/logout");
      navigate("/login"); // Redirect to login page or home page
    } catch (err) {
      console.error("Failed to log out");
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
        {/* Add more profile details as needed */}
      </div>
      <div className="posts">
        {/* Example posts */}
        <div className="post">Post 1</div>
        <div className="post">Post 2</div>
      </div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default UserProfile;
