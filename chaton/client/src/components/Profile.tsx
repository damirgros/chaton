import React from "react";

interface ProfileProps {
  user: { username: string; email: string };
}

const Profile: React.FC<ProfileProps> = ({ user }) => (
  <div className="profile">
    <h2>Profile</h2>
    <p>Username: {user.username}</p>
    <p>Email: {user.email}</p>
    {/* Additional profile information can go here */}
  </div>
);

export default Profile;
