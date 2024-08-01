import React, { useEffect, useState } from "react";
import axios from "axios";
import { User } from "../types/types";

interface FollowProps {
  userId: string;
}

const Follow: React.FC<FollowProps> = ({ userId }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [followedUsers, setFollowedUsers] = useState<User[]>([]);
  const [recommendedUsers, setRecommendedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch followed and recommended users when the component mounts
  useEffect(() => {
    fetchFollowedUsers();
    fetchRecommendedUsers();
  }, [userId]);

  const fetchFollowedUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ users: User[] }>(`/api/user/${userId}/followed`);
      console.log("Fetched followed users:", response.data.users);
      setFollowedUsers(response.data.users);
    } catch (err) {
      console.error("Failed to fetch followed users:", err);
      setError("Failed to fetch followed users");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedUsers = async () => {
    try {
      const response = await axios.get<{ users: User[] }>(`/api/user/${userId}/recommended`);
      setRecommendedUsers(response.data.users);
    } catch (err) {
      console.error("Failed to fetch recommended users:", err);
      setError("Failed to fetch recommended users");
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) return;
    try {
      setLoading(true);
      const response = await axios.get<{ users: User[] }>(`/api/user/${userId}/search`, {
        params: { searchTerm },
      });
      const filteredResults = response.data.users.filter((u) => u.id !== userId);
      setSearchResults(filteredResults);
    } catch (err) {
      console.error("Search failed:", err);
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userIdToFollow: string) => {
    if (!userIdToFollow) {
      console.error("Invalid userIdToFollow:", userIdToFollow);
      return;
    }

    console.log("Attempting to follow user:", userIdToFollow);

    try {
      setLoading(true);
      await axios.post(`/api/user/${userId}/follow`, { userIdToFollow });
      console.log("Follow request successful");

      // Remove the followed user from the recommended list
      setRecommendedUsers((prev) => prev.filter((u) => u.id !== userIdToFollow));

      // Fetch a new recommended user
      fetchRecommendedUsers();

      // Optionally update followed users list
      fetchFollowedUsers();
    } catch (err) {
      console.error("Follow action failed:", err);
      setError("Follow action failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (userIdToUnfollow: string) => {
    if (!userIdToUnfollow) {
      console.error("Invalid userIdToUnfollow:", userIdToUnfollow);
      setError("Invalid userIdToUnfollow");
      return;
    }

    try {
      await axios.post(`/api/user/${userId}/unfollow`, { userIdToUnfollow });
      setFollowedUsers((prev) => prev.filter((u) => u.id !== userIdToUnfollow));
      fetchFollowedUsers(); // Refresh the list of followed users
    } catch (err) {
      console.error("Unfollow action failed:", err);
      setError("Unfollow action failed");
    }
  };

  return (
    <div className="follow-page">
      <h2>Follow Users</h2>
      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for users..."
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      {error && <p>{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <h3>Search Results</h3>
          <ul>
            {searchResults.map((u) => (
              <li key={u.id}>
                {u.username}
                <button onClick={() => handleFollow(u.id)}>Follow</button>
              </li>
            ))}
          </ul>
          <h3>Followed Users</h3>
          <ul>
            {followedUsers.map((u) => (
              <li key={u.id}>
                {u.username}
                <button onClick={() => handleUnfollow(u.id)}>Unfollow</button>
              </li>
            ))}
          </ul>
          <h3>Recommended Users</h3>
          <ul>
            {recommendedUsers.map((u) => (
              <li key={u.id}>
                {u.username}
                <button onClick={() => handleFollow(u.id)}>Follow</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Follow;
