import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import ModelBuilder from "./components/ModelBuilder";
import ModelsList from "./components/ModelsList";
import { api } from "./api";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    // store token
    localStorage.setItem("token", token);
  }, [token]);

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <div className="container">
      <header>
        <h1>Auto-CRUD Platform (Demo)</h1>
        <div>
          {token ? <button onClick={logout}>Logout</button> : null}
        </div>
      </header>

      {!token ? (
        <Login onLogin={(t) => setToken(t)} />
      ) : (
        <>
          <div className="columns">
            <div className="col-left">
              <ModelBuilder token={token} />
              <hr />
              <ModelsList token={token} />
            </div>
          </div>
        </>
      )}

      <footer style={{ marginTop: 40, fontSize: 12, color: "#666" }}>
        Demo: publish a model (Admin role), then open model view to create/list records.
      </footer>
    </div>
  );
}

export default App;
