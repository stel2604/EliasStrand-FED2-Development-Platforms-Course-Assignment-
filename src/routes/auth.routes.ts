import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";

const router = Router();

// TODO: Flytt JWT_SECRET til .env før produksjon
const JWT_SECRET = "super_secret_dev_key";

/* =======================
   POST /auth/register
   Opprett ny bruker
======================= */
router.post("/register", async (req, res) => {
  const { e_post, password } = req.body || {};

  if (!e_post || !password) {
    return res.status(400).json({ message: "Manglende data" });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.execute(
      "INSERT INTO brukere (e_post, password_hash) VALUES (?, ?)",
      [e_post, passwordHash]
    );

    res.status(201).json({ message: "Bruker opprettet" });
  } catch (err: any) {
    console.error("REGISTER ERROR:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "E-post finnes allerede" });
    }

    res.status(500).json({ message: "Serverfeil" });
  }
});

/* =======================
   POST /auth/login
   Login + JWT
======================= */
router.post("/login", async (req, res) => {
  const { e_post, password } = req.body || {};

  if (!e_post || !password) {
    return res.status(400).json({ message: "Manglende data" });
  }

  try {
    const [rows]: any = await pool.execute(
      "SELECT id, e_post, password_hash FROM brukere WHERE e_post = ?",
      [e_post]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Ugyldig e-post eller passord" });
    }

    const user = rows[0];

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Ugyldig e-post eller passord" });
    }

    const token = jwt.sign(
      { id: user.id, e_post: user.e_post },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Innlogging vellykket",
      token,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Serverfeil" });
  }
});

/* =======================
   GET /auth/me
   Beskyttet – verifiser token
======================= */
router.get("/me", requireAuth, (req: AuthRequest, res) => {
  res.json({
    message: "Token OK",
    bruker: req.user,
  });
});

export default router;
