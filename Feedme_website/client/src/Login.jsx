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
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      localStorage.setItem("feedme_token", data.token);
      login(data.user);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Could not login.");
    }
  };

  return (
    <div className="lm-shell">
      <div style={{ maxWidth: "500px", margin: "60px auto", background: "#fff", padding: "30px", borderRadius: "16px" }}>
        <h1>Login</h1>
        <form onSubmit={handleLogin} className="checkout-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <div className="checkout-error">{error}</div>}

          <button type="submit" className="checkout-placeBtn">
            Login
          </button>
        </form>

        <p style={{ marginTop: "16px" }}>
          Need an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}