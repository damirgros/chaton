// src/App.tsx

import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import UserProfile from "./UserProfile";
import Login from "./Login";
import Register from "./Register";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/user/:userId" element={<UserProfile />} />
    </Routes>
  );
};

export default App;
