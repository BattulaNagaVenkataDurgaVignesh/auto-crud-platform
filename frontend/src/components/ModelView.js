import React, { useState, useEffect } from "react";
import { api } from "../api";

/**
 * Generic model view: list records, create new record using simple inputs.
 */
export default function ModelView({ token, model }) {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({});
  const base = (model.tableName || model.name).toLowerCase();

  async function fetchRecords() {
    try {
      const res = await api(token).get(`/api/${base}`);
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(()=> { fetchRecords(); }, [model]);

  async function create(e) {
    e.preventDefault();
    try {
      await api(token).post(`/api/${base}`, form);
      setForm({});
      fetchRecords();
    } catch (err) {
      alert(err.response?.data?.error || "Create failed");
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete record?")) return;
    try {
      await api(token).delete(`/api/${base}/${id}`);
      fetchRecords();
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      <h4>{model.name} — Records</h4>

      <form onSubmit={create} style={{ marginBottom:12 }}>
        {model.fields.map(f => (
          <div key={f.name} style={{ marginBottom:6 }}>
            <label>{f.name}</label>
            <input
              value={form[f.name] || ""}
              onChange={(e)=>setForm({...form, [f.name]: e.target.value})}
            />
          </div>
        ))}
        <button type="submit">Create</button>
      </form>

      <table style={{ width: "100%", borderCollapse:"collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom:"1px solid #ccc" }}>ID</th>
            {model.fields.map(f => <th key={f.name} style={{ borderBottom:"1px solid #ccc" }}>{f.name}</th>)}
            <th style={{ borderBottom:"1px solid #ccc" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map(r => (
            <tr key={r.id}>
              <td style={{ padding:6, borderBottom:"1px solid #eee" }}>{r.id}</td>
              {model.fields.map(f => <td key={f.name} style={{ padding:6, borderBottom:"1px solid #eee" }}>{String(r[f.name] ?? "")}</td>)}
              <td style={{ padding:6 }}>
                <button onClick={()=>remove(r.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
