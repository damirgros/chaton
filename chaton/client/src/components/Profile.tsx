import React from "react";
import { ProfileProps } from "../types/types";

const Profile: React.FC<ProfileProps> = ({ user }) => (
  <div className="profile">
    <h2>Profile</h2>
    <p>Username: {user.username}</p>
    <p>Email: {user.email}</p>
  </div>
);

export default Profile;
