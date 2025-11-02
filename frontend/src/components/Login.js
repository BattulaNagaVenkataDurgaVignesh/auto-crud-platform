import React, { useState } from "react";
import axios from "axios";

export default function Login({ onLogin }) {
  const [id, setId] = useState("");
  const [role, setRole] = useState("Admin");
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:4000/api/login", { id, role });
      onLogin(res.data.token);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  }

  return (
    <div className="card">
      <h2>Login (demo)</h2>
      <form onSubmit={submit}>
        <label>User ID</label>
        <input value={id} onChange={(e) => setId(e.target.value)} placeholder="user-id (e.g., user1)" required />
        <label>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option>Admin</option>
          <option>Manager</option>
          <option>Viewer</option>
        </select>
        <button type="submit">Login</button>
        {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
        <div className="small" style={{ marginTop:6 }}>
          (This demo login issues a token containing the chosen id & role — no password)
        </div>
      </form>
    </div>
  );
}
