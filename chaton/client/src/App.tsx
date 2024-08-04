// src/App.tsx

import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import UserPage from "./pages/UserPage/UserPage";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/user/:userId" element={<UserPage />} />
    </Routes>
  );
};

export default App;
