// HomePage.tsx

import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";

interface HomePageProps {}

const HomePage: React.FC<HomePageProps> = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleView = () => {
    setIsLogin(!isLogin);
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
    </div>
  );
};

export default HomePage;
