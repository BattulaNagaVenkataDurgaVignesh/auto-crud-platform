import axios from "axios";

const BASE = process.env.REACT_APP_API_BASE || "http://localhost:4000";

export function api(token) {
  const instance = axios.create({ baseURL: BASE });
  if (token) instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  return instance;
}
