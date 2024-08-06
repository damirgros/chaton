import React, { useState } from "react";
import Login from "../../components/Login/Login";
import Register from "../../components/Register/Register";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { HomePageProps } from "../../types/types";
import styles from "./HomePage.module.css";
import Logo from "../../assets/chaton-logo.svg";

const HomePage: React.FC<HomePageProps> = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const toggleView = () => {
    setIsLogin(!isLogin);
  };

  const handleGuestLogin = async () => {
    try {
      const response = await axios.post("/api/auth/guest-login");
      const { userId } = response.data;
      navigate(`/user/${userId}`);
      setError(null);
    } catch (err) {
      setError("Failed to sign in as guest. Please try again.");
    }
  };

  return (
    <div className={styles.homePage}>
      <Logo />
      <h1>{isLogin ? "Login" : "Register"}</h1>
      {error && <p className={styles.error}>{error}</p>}
      {isLogin ? <Login /> : <Register />}
      <div className={styles.toggleMessage}>
        <div>
          {isLogin ? (
            <p className={styles.message}>
              If you don't have an account,
              <button className={styles.buttonHome} onClick={toggleView}>
                Register here
              </button>
            </p>
          ) : (
            <p className={styles.message}>
              If you already have an account,
              <button className={styles.buttonHome} onClick={toggleView}>
                Login here
              </button>
            </p>
          )}
        </div>
        <div>
          <button className={styles.buttonHome} onClick={handleGuestLogin}>
            Sign in as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
