import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { saveModel, loadAllModels } from "./utils/modelStore";
import { createModelRouter } from "./routes/modelRouter";
import { authMiddleware, generateToken } from "./middleware/auth";
import { ModelDef } from "./types";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// In-memory map of registered routers for cleanup if needed
const registeredModels = new Map<string, express.Router>();

// Simple /api/login for demo (no password). Request: { id, role }
app.post("/api/login", (req, res) => {
  const { id, role } = req.body;
  if (!id || !role) return res.status(400).json({ error: "Provide id and role" });
  const token = generateToken({ id, role });
  res.json({ token });
});

// Publish model endpoint
app.post("/api/publish-model", authMiddleware, async (req, res) => {
  // Only Admin can publish models (simple rule)
  if (req.user?.role !== "Admin") return res.status(403).json({ error: "Only Admin can publish models" });
  const model = req.body as ModelDef;
  if (!model || !model.name || !Array.isArray(model.fields)) {
    return res.status(400).json({ error: "Invalid model definition" });
  }
  try {
    // normalize model table name
    if (!model.tableName) {
      model.tableName = (model.name || "").toLowerCase() + "s";
    }
    await saveModel(model);
    // register routes immediately
    registerModel(model);
    res.json({ success: true, model });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// List models
app.get("/api/models", authMiddleware, async (req, res) => {
  try {
    const models = await loadAllModels();
    res.json(models);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// Register a model's routes under /api/<tableName>
function registerModel(model: ModelDef) {
  const base = (model.tableName || model.name).toLowerCase();
  // avoid duplicate registration
  if (registeredModels.has(base)) {
    // could remove and re-register (not implemented) — for now, skip
    console.log(`Model ${base} already registered`);
    return;
  }
  const router = createModelRouter(model);
  app.use(`/api/${base}`, authMiddleware, router); // protect all model endpoints with auth
  registeredModels.set(base, router);
  console.log(`Registered routes for ${base}`);
}

// On startup, load and register all existing models
(async () => {
  const models = await loadAllModels();
  for (const m of models) {
    registerModel(m);
  }
})();

// Serve simple static for frontend if built (optional)
app.use(express.static(path.join(__dirname, "../../frontend/build")));

const PORT = process.env.PORT || 4000;
app.use(express.static(path.join(__dirname, "../../frontend/static-ui")));
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Open http://localhost:${PORT}`);
});
