import React, { useEffect, useState } from "react";
import axios from "axios";
import { User, FollowProps } from "../../types/types";
import gravatar from "gravatar";
import styles from "./Follow.module.css";

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
      setFollowedUsers(response.data.users);
    } catch (err) {
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
      setRecommendedUsers((prev) => prev.filter((u) => u.id !== userIdToFollow));
      fetchRecommendedUsers();
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
      fetchFollowedUsers();
    } catch (err) {
      setError("Unfollow action failed");
    }
  };

  return (
    <div className={styles.followPage}>
      <h2>Follow Users</h2>
      <div className={styles.searchContainer}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for users..."
          className={styles.searchInput}
        />
        <button onClick={handleSearch} className={styles.searchButton}>
          Search
        </button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {loading ? (
        <p className={styles.loading}>Loading...</p>
      ) : (
        <>
          <h3>Search Results</h3>
          <ul className={styles.userList}>
            {searchResults.length === 0 ? (
              <p>No users found. Try searching for different terms...</p>
            ) : (
              searchResults.map((u) => (
                <li key={u.id} className={styles.userItem}>
                  <img
                    src={
                      u.profilePicture?.startsWith("http")
                        ? u.profilePicture
                        : `https://chaton-server-bgsr.onrender.com${u.profilePicture}`
                    }
                    alt="Profile Picture"
                    className={styles.userAvatar}
                    onError={(e) => {
                      console.error(`Error loading image: ${u.profilePicture}`, e);
                      e.currentTarget.src = gravatar.url(u.email, { s: "200", d: "retro" }, true);
                    }}
                  />
                  <div className={styles.userInfo}>
                    <p>Username: {u.username}</p>
                    <p>Bio: {u.bio}</p>
                    <p>Location: {u.location}</p>
                    <button onClick={() => handleFollow(u.id)} className={styles.followButton}>
                      Follow
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
          <hr />
          <h3>Followed Users</h3>
          <ul className={styles.userList}>
            {followedUsers.length === 0 ? (
              <p>No users followed.</p>
            ) : (
              followedUsers.map((u) => (
                <li key={u.id} className={styles.userItem}>
                  <img
                    src={
                      u.profilePicture?.startsWith("http")
                        ? u.profilePicture
                        : `https://chaton-server-bgsr.onrender.com${u.profilePicture}`
                    }
                    alt="Profile Picture"
                    className={styles.userAvatar}
                    onError={(e) => {
                      console.error(`Error loading image: ${u.profilePicture}`, e);
                      e.currentTarget.src = gravatar.url(u.email, { s: "200", d: "retro" }, true);
                    }}
                  />
                  <div className={styles.userInfo}>
                    <p>Username: {u.username}</p>
                    <p>Bio: {u.bio}</p>
                    <p>Location: {u.location}</p>
                    <button onClick={() => handleUnfollow(u.id)} className={styles.unfollowButton}>
                      Unfollow
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
          <hr />
          <h3>Recommended Users</h3>
          <ul className={styles.userList}>
            {recommendedUsers.map((u) => (
              <li key={u.id} className={styles.userItem}>
                <img
                  src={
                    u.profilePicture?.startsWith("http")
                      ? u.profilePicture
                      : `https://chaton-server-bgsr.onrender.com${u.profilePicture}`
                  }
                  alt="Profile Picture"
                  className={styles.userAvatar}
                  onError={(e) => {
                    console.error(`Error loading image: ${u.profilePicture}`, e);
                    e.currentTarget.src = gravatar.url(u.email, { s: "200", d: "retro" }, true);
                  }}
                />
                <div className={styles.userInfo}>
                  <p>Username: {u.username}</p>
                  <p>Bio: {u.bio}</p>
                  <p>Location: {u.location}</p>
                  <button onClick={() => handleFollow(u.id)} className={styles.followButton}>
                    Follow
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Follow;
