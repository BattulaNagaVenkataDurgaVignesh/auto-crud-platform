import express from "express";
import { ModelDef } from "../types";
import * as dataStore from "../utils/dataStore";
import { checkPermissions, checkOwnershipIfRequired } from "../middleware/rbac";
import { Request, Response } from "express";

/**
 * Creates and returns an Express Router for the provided model
 */
export function createModelRouter(model: ModelDef) {
  const router = express.Router();

  // POST /api/<model>  - create
  router.post(
    "/",
    checkPermissions(model, "create"),
    async (req: Request, res: Response) => {
      try {
        const payload = req.body;
        // Basic required check
        for (const f of model.fields) {
          if (f.required && (payload[f.name] === undefined || payload[f.name] === null)) {
            return res.status(400).json({ error: `Field ${f.name} is required` });
          }
        }
        // If ownerField exists and not provided, set from req.user
        if (model.ownerField && req.user && !payload[model.ownerField]) {
          payload[model.ownerField] = req.user.id;
        }
        const created = await dataStore.createRecord(model.name, payload);
        res.status(201).json(created);
      } catch (err: any) {
        res.status(500).json({ error: err.message || "Server error" });
      }
    }
  );

  // GET /api/<model> - list
  router.get(
    "/",
    checkPermissions(model, "read"),
    async (req: Request, res: Response) => {
      try {
        const all = await dataStore.readAllRecords(model.name);
        res.json(all);
      } catch (err: any) {
        res.status(500).json({ error: err.message || "Server error" });
      }
    }
  );

  // GET /api/<model>/:id - get single
  router.get(
    "/:id",
    checkPermissions(model, "read"),
    async (req: Request, res: Response) => {
      try {
        const rec = await dataStore.getRecord(model.name, req.params.id);
        if (!rec) return res.status(404).json({ error: "Not found" });
        res.json(rec);
      } catch (err: any) {
        res.status(500).json({ error: err.message || "Server error" });
      }
    }
  );

  // PUT /api/<model>/:id - update
  router.put(
    "/:id",
    checkPermissions(model, "update"),
    async (req: Request, res: Response, next) => {
      // load record for ownership check
      try {
        const rec = await dataStore.getRecord(model.name, req.params.id);
        if (!rec) return res.status(404).json({ error: "Not found" });
        res.locals.record = rec;
        return next();
      } catch (err: any) {
        return res.status(500).json({ error: err.message || "Server error" });
      }
    },
    checkOwnershipIfRequired(model, "update"),
    async (req: Request, res: Response) => {
      try {
        const updated = await dataStore.updateRecord(model.name, req.params.id, req.body);
        res.json(updated);
      } catch (err: any) {
        res.status(500).json({ error: err.message || "Server error" });
      }
    }
  );

  // DELETE /api/<model>/:id
  router.delete(
    "/:id",
    checkPermissions(model, "delete"),
    async (req: Request, res: Response, next) => {
      try {
        const rec = await dataStore.getRecord(model.name, req.params.id);
        if (!rec) return res.status(404).json({ error: "Not found" });
        res.locals.record = rec;
        return next();
      } catch (err: any) {
        return res.status(500).json({ error: err.message || "Server error" });
      }
    },
    checkOwnershipIfRequired(model, "delete"),
    async (req: Request, res: Response) => {
      try {
        const ok = await dataStore.deleteRecord(model.name, req.params.id);
        if (!ok) return res.status(500).json({ error: "Delete failed" });
        return res.json({ success: true });
      } catch (err: any) {
        res.status(500).json({ error: err.message || "Server error" });
      }
    }
  );

  return router;
}
