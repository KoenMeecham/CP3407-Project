import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";
import { useUser } from "./UserContext";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useUser();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          f_name: firstName,
          l_name: lastName, // ✅ FIXED (was lastName)
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed.");
        return;
      }

      // ✅ store token
      localStorage.setItem("feedme_token", data.token);

      // ✅ store full user + token
      login({ ...data.user, token: data.token });

      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Could not register user.");
    }
  };

  return (
    <div className="lm-shell">
      <div
        style={{
          maxWidth: "500px",
          margin: "60px auto",
          background: "#fff",
          padding: "30px",
          borderRadius: "16px",
        }}
      >
        <h1>Register</h1>
        <form onSubmit={handleRegister} className="checkout-form">
          <input
            type="text"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
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
            Create Account
          </button>
        </form>

        <p style={{ marginTop: "16px" }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}