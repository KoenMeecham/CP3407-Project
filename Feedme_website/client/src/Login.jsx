import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";
import { useUser } from "./UserContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      login(data.user);
      navigate("/");
    } catch (err) {
      setError("Could not log in.");
    }
  };

  return (
    <div className="lm-shell">
      <div className="lm-authWrap">
        <div className="lm-card lm-authCard">
          <h2>Login</h2>

          <form onSubmit={handleLogin} className="lm-authForm">
            <input
              className="lm-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              className="lm-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <div className="lm-error">{error}</div>}

            <button type="submit" className="lm-btnPrimary">
              Login
            </button>
          </form>

          <p className="lm-authText">
            Don’t have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
