import React, { useEffect, useState } from "react";
import { api } from "../api";
import ModelView from "./ModelView";

export default function ModelsList({ token }) {
  const [models, setModels] = useState([]);
  const [selected, setSelected] = useState(null);

  async function load() {
    try {
      const res = await api(token).get("/api/models");
      setModels(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(()=> { load(); }, []);

  return (
    <div className="card">
      <h3>Published Models</h3>
      <div>
        {models.length === 0 && <div>No models published yet.</div>}
        <ul>
          {models.map(m => (
            <li key={m.name}>
              <button onClick={()=>setSelected(m)}>{m.name}</button>
            </li>
          ))}
        </ul>
      </div>

      {selected && <ModelView token={token} model={selected} />}
    </div>
  );
}
