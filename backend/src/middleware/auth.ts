import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET = "supersecret_demo_key_change_me";

export type AuthUser = { id: string; role: string };

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function generateToken(user: AuthUser) {
  return jwt.sign(user, SECRET, { expiresIn: "8h" });
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Missing authorization" });
  const parts = auth.split(" ");
  if (parts.length !== 2) return res.status(401).json({ error: "Bad authorization header" });
  const token = parts[1];
  try {
    const decoded = jwt.verify(token, SECRET) as AuthUser;
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
