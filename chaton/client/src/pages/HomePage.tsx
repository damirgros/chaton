import React, { useState } from "react";
import Login from "../components/Login";
import Register from "../components/Register";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { HomePageProps } from "../types/types";

const HomePage: React.FC<HomePageProps> = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const toggleView = () => {
    setIsLogin(!isLogin);
  };

  const handleGuestLogin = async () => {
    try {
      const response = await axios.post("/api/auth/guest-login");
      const { userId } = response.data;
      navigate(`/user/${userId}`);
    } catch (err) {
      console.error("Failed to sign in as guest", err);
    }
  };

  return (
    <div className="home-page">
      <h1>{isLogin ? "Login" : "Register"}</h1>
      {isLogin ? <Login /> : <Register />}
      <div className="toggle-message">
        {isLogin ? (
          <p>
            If you don't have an account,
            <button onClick={toggleView}>Register here</button>
          </p>
        ) : (
          <p>
            If you already have an account,
            <button onClick={toggleView}>Login here</button>
          </p>
        )}
      </div>
      <div className="guest-login">
        <p>
          Or,
          <button onClick={handleGuestLogin}>Sign in as Guest</button>
        </p>
      </div>
    </div>
  );
};

export default HomePage;
