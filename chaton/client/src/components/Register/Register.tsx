import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./Register.module.css";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("/api/auth/register", {
        email,
        password,
        username,
      });
      if (response.data.redirectUrl) {
        navigate(response.data.redirectUrl);
      }
    } catch (err) {
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputGroup}>
        <input
          type="text"
          placeholder="Username"
          name="username"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={styles.input}
          autoComplete="on"
        />
      </div>
      <div>
        <input
          type="email"
          placeholder="Email"
          name="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={styles.input}
          autoComplete="on"
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Password"
          name="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={styles.input}
          autoComplete="on"
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.buttonBox}>
        <button className={styles.buttonRegister} type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </div>
    </form>
  );
};

export default Register;
