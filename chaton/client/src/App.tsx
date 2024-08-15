import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import UserPage from "./pages/UserPage/UserPage";
import NotFound from "./pages/NotFound/NotFound";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/user/:userId" element={<UserPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
