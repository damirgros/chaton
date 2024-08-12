import React, { useState, useEffect } from "react";
import axios from "axios";
import { ProfileProps } from "../../types/types";
import gravatar from "gravatar";
import { useNavigate } from "react-router-dom";
import styles from "./Profile.module.css";

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState<string>(user.bio || "");
  const [location, setLocation] = useState<string>(user.location || "");
  const [profilePicture, setProfilePicture] = useState<string>(
    user.profilePicture || gravatar.url(user.email, { s: "200", d: "retro" }, true)
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`/api/user/${user.id}`);
        const updatedUser = response.data.user;

        setBio(updatedUser.bio || "");
        setLocation(updatedUser.location || "");
        setProfilePicture(
          updatedUser.profilePicture || gravatar.url(user.email, { s: "200", d: "retro" }, true)
        );
        setError(null);
      } catch (err) {
        setError("Error fetching user data.");
      }
    };

    fetchUserData();
  }, [user.id, user.email]);

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("bio", bio);
    formData.append("location", location);
    if (selectedFile) {
      formData.append("profilePicture", selectedFile);
    }

    try {
      const response = await axios.put(`/api/user/${user.id}/profile`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedUser = response.data.user;
      setBio(updatedUser.bio);
      setLocation(updatedUser.location);
      setProfilePicture(
        updatedUser.profilePicture || gravatar.url(user.email, { s: "200", d: "retro" }, true)
      );
      setEditMode(false);
      setError(null);
    } catch (err) {
      setError("Error updating profile.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setProfilePicture(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(`/api/user/${user.id}`);
      navigate("/");
    } catch (err) {
      setError("Error deleting account.");
    }
  };

  return (
    <div className={styles.profile}>
      <h2 className={styles.profileTitle}>Profile</h2>
      {error && <p className={styles.error}>{error}</p>}
      <img
        src={`https://chaton-server-bgsr.onrender.com${user.profilePicture}` || profilePicture}
        alt="Profile Picture"
        className={styles.profileImage}
        onError={(e) => {
          console.error(`Error loading image: ${profilePicture}`, e);
          e.currentTarget.src = gravatar.url(user.email, { s: "200", d: "retro" }, true);
        }}
      />
      <p className={styles.profileText}>Username: {user.username}</p>
      <p className={styles.profileText}>Email: {user.email}</p>
      {editMode ? (
        <div className={styles.editForm}>
          <label className={styles.formLabel}>
            Bio:
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={styles.input}
            />
          </label>
          <label className={styles.formLabel}>
            Location:
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={styles.input}
            />
          </label>
          <label className={styles.formLabel}>
            Profile Picture:
            <input
              type="file"
              accept="image/*"
              name="profilePicture"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
          </label>
          <button onClick={handleSave} className={styles.saveButton}>
            Save
          </button>
        </div>
      ) : (
        <div className={styles.profileDetails}>
          <p className={styles.profileText}>Bio: {bio || "No bio available"}</p>
          <p className={styles.profileText}>Location: {location || "No location available"}</p>
          <button onClick={() => setEditMode(true)} className={styles.editButton}>
            Edit Profile
          </button>
        </div>
      )}
      <button onClick={handleDeleteAccount} className={styles.deleteButton}>
        Delete Account
      </button>
    </div>
  );
};

export default Profile;
