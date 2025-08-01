import React, { useState } from "react";
import "./LoginRegister.css";

const API_BASE = "http://localhost:3001/api";

export default function LoginRegister({ onLogin }) {
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!username || !password) {
      setMessage("username and password cannot be empty");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        if (mode === "login") {
          localStorage.setItem("token", data.token);
          onLogin && onLogin();
        } else {
          setMode("login");
          setMessage("register successful, please login");
        }
      } else {
        setMessage(data.message || "operation failed");
      }
    } catch (err) {
      setMessage("network error");
    }
    setLoading(false);
  };

  return (
    <div className="login-register-container">
      <div className="card">
        <h2 className="app-title">HomeQuest</h2>
        <h3>{mode === "login" ? "Login" : "Register"}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
          <input
            type="password"
            placeholder="enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "processing..." : mode === "login" ? "Login" : "Register"}
          </button>
        </form>
        <div className="switch-mode">
          {mode === "login" ? (
            <>
              do not have an account?{" "}
              <span onClick={() => setMode("register")}>register</span>
            </>
          ) : (
            <>
              already have an account?{" "}
              <span onClick={() => setMode("login")}>login</span>
            </>
          )}
        </div>
        {message && <div className="message">{message}</div>}
      </div>
    </div>
  );
}