import { Router } from "express";
import { pool } from "../db";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";

const router = Router();

/* =======================
   GET /articles/:id/comments
   Offentlig – hent kommentarer til artikkel
======================= */
router.get("/articles/:id/comments", async (req, res) => {
  const articleId = Number(req.params.id);

  if (!Number.isInteger(articleId)) {
    return res.status(400).json({ message: "Ugyldig artikkel-id" });
  }

  try {
    const [rows] = await pool.execute(
      `
      SELECT 
        kommentarer.id,
        kommentarer.innhold,
        kommentarer.opprettet_paa,
        brukere.e_post AS forfatter
      FROM kommentarer
      JOIN brukere ON kommentarer.bruker_id = brukere.id
      WHERE kommentarer.artikkel_id = ?
      ORDER BY kommentarer.opprettet_paa ASC
      `,
      [articleId]
    );

    res.json(rows); // tom array hvis ingen kommentarer
  } catch (err) {
    console.error("GET COMMENTS ERROR:", err);
    res.status(500).json({ message: "Serverfeil" });
  }
});

/* =======================
   POST /articles/:id/comments
   Beskyttet – legg til kommentar
======================= */
router.post(
  "/articles/:id/comments",
  requireAuth,
  async (req: AuthRequest, res) => {
    const articleId = Number(req.params.id);
    const { innhold } = req.body || {};

    if (!Number.isInteger(articleId)) {
      return res.status(400).json({ message: "Ugyldig artikkel-id" });
    }

    if (!innhold || !innhold.trim()) {
      return res.status(400).json({ message: "Kommentar kan ikke være tom" });
    }

    try {
      // Sjekk at artikkel finnes
      const [articleRows]: any = await pool.execute(
        "SELECT id FROM artikler WHERE id = ?",
        [articleId]
      );

      if (articleRows.length === 0) {
        return res.status(404).json({ message: "Artikkel ikke funnet" });
      }

      await pool.execute(
        `
        INSERT INTO kommentarer (artikkel_id, bruker_id, innhold)
        VALUES (?, ?, ?)
        `,
        [articleId, req.user!.id, innhold]
      );

      res.status(201).json({ message: "Kommentar opprettet" });
    } catch (err) {
      console.error("POST COMMENT ERROR:", err);
      res.status(500).json({ message: "Serverfeil" });
    }
  }
);

/* =======================
   PUT /comments/:id
   Beskyttet – rediger egen kommentar
======================= */
router.put("/comments/:id", requireAuth, async (req: AuthRequest, res) => {
  const commentId = Number(req.params.id);
  const { innhold } = req.body || {};

  if (!Number.isInteger(commentId)) {
    return res.status(400).json({ message: "Ugyldig kommentar-id" });
  }

  if (!innhold || !innhold.trim()) {
    return res.status(400).json({ message: "Kommentar kan ikke være tom" });
  }

  try {
    const [rows]: any = await pool.execute(
      "SELECT bruker_id FROM kommentarer WHERE id = ?",
      [commentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Kommentar ikke funnet" });
    }

    if (rows[0].bruker_id !== req.user!.id) {
      return res.status(403).json({ message: "Du kan kun redigere egne kommentarer" });
    }

    await pool.execute(
      "UPDATE kommentarer SET innhold = ? WHERE id = ?",
      [innhold, commentId]
    );

    res.json({ message: "Kommentar oppdatert" });
  } catch (err) {
    console.error("PUT COMMENT ERROR:", err);
    res.status(500).json({ message: "Serverfeil" });
  }
});

/* =======================
   DELETE /comments/:id
   Beskyttet – slett egen kommentar
======================= */
router.delete("/comments/:id", requireAuth, async (req: AuthRequest, res) => {
  const commentId = Number(req.params.id);

  if (!Number.isInteger(commentId)) {
    return res.status(400).json({ message: "Ugyldig kommentar-id" });
  }

  try {
    const [rows]: any = await pool.execute(
      "SELECT bruker_id FROM kommentarer WHERE id = ?",
      [commentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Kommentar ikke funnet" });
    }

    if (rows[0].bruker_id !== req.user!.id) {
      return res.status(403).json({ message: "Du kan kun slette egne kommentarer" });
    }

    await pool.execute(
      "DELETE FROM kommentarer WHERE id = ?",
      [commentId]
    );

    res.json({ message: "Kommentar slettet" });
  } catch (err) {
    console.error("DELETE COMMENT ERROR:", err);
    res.status(500).json({ message: "Serverfeil" });
  }
});

export default router;
