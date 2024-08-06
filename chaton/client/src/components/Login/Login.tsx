import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css"; // Import the CSS module

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/auth/login", { email, password });
      if (response.data.redirectUrl) {
        navigate(response.data.redirectUrl);
      }
    } catch (err) {
      console.error("Login error:", err);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || "Login failed");
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputGroup}>
        <input
          type="email"
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          required
          className={styles.input}
        />
      </div>
      <div>
        <input
          type="password"
          value={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          required
          className={styles.input}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.buttonBox}>
        <button className={styles.buttonLogin} type="submit">
          Login
        </button>
      </div>
    </form>
  );
};

export default Login;
