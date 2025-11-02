import React, { useState } from "react";
import { api } from "../api";

function blankField() {
  return { name: "", type: "string", required: false, default: "", unique: false, relation: "" };
}

export default function ModelBuilder({ token }) {
  const [modelName, setModelName] = useState("");
  const [fields, setFields] = useState([blankField()]);
  const [ownerField, setOwnerField] = useState("");
  const [message, setMessage] = useState("");
  const [rolePerms, setRolePerms] = useState({
    Admin: ["all"],
    Manager: ["create", "read", "update"],
    Viewer: ["read"]
  });

  function updateField(i, key, val) {
    const copy = [...fields];
    copy[i][key] = val;
    setFields(copy);
  }

  function addField() {
    setFields([...fields, blankField()]);
  }

  function removeField(i) {
    const copy = fields.filter((_, idx) => idx !== i);
    setFields(copy);
  }

  async function publish(e) {
    e.preventDefault();
    if (!modelName) return setMessage("Model name required");
    const model = {
      name: modelName,
      fields: fields.map(f => ({ name: f.name, type: f.type, required: f.required })),
      ownerField: ownerField || null,
      rbac: rolePerms
    };
    try {
      const res = await api(token).post("/api/publish-model", model);
      setMessage("Published: " + res.data.model.name);
      setModelName("");
      setFields([blankField()]);
      setOwnerField("");
    } catch (err) {
      setMessage(err.response?.data?.error || "Publish failed");
    }
  }

  return (
    <div className="card">
      <h2>Model Builder</h2>
      <form onSubmit={publish}>
        <label>Model Name</label>
        <input value={modelName} onChange={(e)=>setModelName(e.target.value)} placeholder="Employee" required />

        <label>Owner Field (optional)</label>
        <input value={ownerField} onChange={(e)=>setOwnerField(e.target.value)} placeholder="ownerId" />

        <label>Fields</label>
        {fields.map((f, i) => (
          <div key={i} style={{ border:"1px dashed #ddd", padding:8, marginBottom:8 }}>
            <input placeholder="field name" value={f.name} onChange={(e)=>updateField(i, "name", e.target.value)} required />
            <select value={f.type} onChange={(e)=>updateField(i,"type", e.target.value)}>
              <option value="string">string</option>
              <option value="number">number</option>
              <option value="boolean">boolean</option>
              <option value="date">date</option>
            </select>
            <label style={{display:"block"}}>
              <input type="checkbox" checked={f.required} onChange={(e)=>updateField(i,"required", e.target.checked)} /> Required
            </label>
            <button type="button" onClick={()=>removeField(i)}>Remove</button>
          </div>
        ))}

        <button type="button" onClick={addField}>Add Field</button>

        <div style={{ marginTop:12 }}>
          <h4>RBAC (quick edit JSON)</h4>
          <textarea rows={4} value={JSON.stringify(rolePerms, null, 2)} onChange={(e)=> {
            try {
              const parsed = JSON.parse(e.target.value);
              setRolePerms(parsed);
            } catch (err) {
              // ignore parse errors
            }
          }} />
        </div>

        <div style={{ marginTop:12 }}>
          <button type="submit">Publish Model</button>
          <span style={{ marginLeft:12 }}>{message}</span>
        </div>
      </form>
    </div>
  );
}
