import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// TODO: Flytt JWT_SECRET til .env før produksjon
const JWT_SECRET = "super_secret_dev_key";

// Utvid Request-typen (TypeScript)
export interface AuthRequest extends Request {
  user?: {
    id: number;
    e_post: string;
  };
}

/* =======================
   JWT autentisering
   Krever Authorization: Bearer <token>
======================= */
export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Mangler eller ugyldig token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      e_post: string;
    };

    req.user = decoded; // 🔐 fest bruker på request
    next();
  } catch {
    return res.status(401).json({ message: "Ugyldig eller utløpt token" });
  }
}
