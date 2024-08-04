import React, { useEffect, useState } from "react";
import axios from "axios";
import { User, FollowProps } from "../../types/types";
import gravatar from "gravatar";
import "./Follow.css";

const Follow: React.FC<FollowProps> = ({ userId }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [followedUsers, setFollowedUsers] = useState<User[]>([]);
  const [recommendedUsers, setRecommendedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
      setError("Invalid userIdToFollow.");
      return;
    }
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
      setError("Follow action failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (userIdToUnfollow: string) => {
    if (!userIdToUnfollow) {
      setError("Invalid userIdToUnfollow");
      return;
    }

    try {
      await axios.post(`/api/user/${userId}/unfollow`, { userIdToUnfollow });
      setFollowedUsers((prev) => prev.filter((u) => u.id !== userIdToUnfollow));
      fetchFollowedUsers(); // Refresh the list of followed users
    } catch (err) {
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
            {searchResults.length === 0 ? (
              <p>Search users to follow...</p>
            ) : (
              searchResults.map((u) => (
                <li key={u.id}>
                  <img
                    src={
                      u.profilePicture?.startsWith("http")
                        ? u.profilePicture
                        : `http://localhost:5000${u.profilePicture}`
                    }
                    alt="Profile Picture"
                    onError={(e) => {
                      console.error(`Error loading image: ${u.profilePicture}`, e);
                      e.currentTarget.src = gravatar.url(u.email, { s: "200", d: "retro" }, true); // Fallback to gravatar
                    }}
                  />
                  <p>Username: {u.username}</p>
                  <p>Bio: {u.bio}</p>
                  <p>Location: {u.location}</p>
                  <button onClick={() => handleFollow(u.id)}>Follow</button>
                </li>
              ))
            )}
          </ul>
          <h3>Followed Users</h3>
          <ul>
            {followedUsers.length === 0 ? (
              <p>No users followed.</p>
            ) : (
              followedUsers.map((u) => (
                <li key={u.id}>
                  <img
                    src={
                      u.profilePicture?.startsWith("http")
                        ? u.profilePicture
                        : `http://localhost:5000${u.profilePicture}`
                    }
                    alt="Profile Picture"
                    onError={(e) => {
                      console.error(`Error loading image: ${u.profilePicture}`, e);
                      e.currentTarget.src = gravatar.url(u.email, { s: "200", d: "retro" }, true); // Fallback to gravatar
                    }}
                  />
                  <p>Username: {u.username}</p>
                  <p>Bio: {u.bio}</p>
                  <p>Location: {u.location}</p>
                  <button onClick={() => handleUnfollow(u.id)}>Unfollow</button>
                </li>
              ))
            )}
          </ul>
          <h3>Recommended Users</h3>
          <ul>
            {recommendedUsers.map((u) => (
              <li key={u.id}>
                <img
                  src={
                    u.profilePicture?.startsWith("http")
                      ? u.profilePicture
                      : `http://localhost:5000${u.profilePicture}`
                  }
                  alt="Profile Picture"
                  onError={(e) => {
                    console.error(`Error loading image: ${u.profilePicture}`, e);
                    e.currentTarget.src = gravatar.url(u.email, { s: "200", d: "retro" }, true); // Fallback to gravatar
                  }}
                />
                <p>Username: {u.username}</p>
                <p>Bio: {u.bio}</p>
                <p>Location: {u.location}</p>
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
