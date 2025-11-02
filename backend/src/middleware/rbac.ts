import { Request, Response, NextFunction } from "express";
import { ModelDef } from "../types";

/**
 * Check permission for an action:
 * action: one of "create","read","update","delete"
 */

export function checkPermissions(model: ModelDef, action: "create" | "read" | "update" | "delete") {
  return (req: Request, res: Response, next: NextFunction) => {
    // model.rbac might be undefined
    const rbac = model.rbac || {};
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Not authenticated" });
    const perms = rbac[user.role] || [];
    if (perms.includes("all") || perms.includes(action)) {
      return next();
    }
    return res.status(403).json({ error: "Forbidden: role doesn't have permission" });
  };
}

/**
 * Ownership enforcement middleware
 * If model.ownerField is set, ensure for update/delete that either:
 * - req.user.id === record[ownerField] OR req.user.role === "Admin"
 *
 * Assumes that previous handler loaded record into res.locals.record
 */
export function checkOwnershipIfRequired(model: ModelDef, action: "update" | "delete") {
  return (req: Request, res: Response, next: NextFunction) => {
    const ownerField = model.ownerField;
    if (!ownerField) return next();
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Not authenticated" });
    const rec = res.locals.record;
    // If record isn't loaded, we can't check here (controller should load and set)
    if (!rec) return res.status(500).json({ error: "Server: record missing for ownership check" });
    if (user.role === "Admin") return next();
    if (rec[ownerField] && rec[ownerField] === user.id) return next();
    return res.status(403).json({ error: "Forbidden: not owner" });
  };
}
