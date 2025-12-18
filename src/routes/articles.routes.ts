import { Router } from "express";
import { pool } from "../db";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";

const router = Router();

/* =======================
   GET /articles
   Offentlig – hent alle artikler
======================= */
router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        artikler.id,
        artikler.tittel,
        artikler.brodtekst,
        artikler.kategori,
        artikler.opprettet_paa,
        brukere.e_post AS forfatter
      FROM artikler
      JOIN brukere ON artikler.innsendt_av = brukere.id
      ORDER BY artikler.opprettet_paa DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("GET ARTICLES ERROR:", err);
    res.status(500).json({ message: "Serverfeil" });
  }
});

/* =======================
   POST /articles/:id/comments
   Beskyttet – legg til kommentar
======================= */
router.post("/:id/comments", requireAuth, async (req: AuthRequest, res) => {
  const articleId = Number(req.params.id);
  const { innhold } = req.body || {};

  if (!Number.isInteger(articleId)) {
    return res.status(400).json({ message: "Ugyldig artikkel-id" });
  }

  if (!innhold || innhold.trim().length === 0) {
    return res.status(400).json({ message: "Kommentar kan ikke være tom" });
  }

  try {
    // 1Sjekk at artikkel finnes
    const [articles]: any = await pool.execute(
      "SELECT id FROM artikler WHERE id = ?",
      [articleId]
    );

    if (articles.length === 0) {
      return res.status(404).json({ message: "Artikkel ikke funnet" });
    }

    //  Opprett kommentar
    await pool.execute(
      `
      INSERT INTO kommentarer (innhold, artikkel_id, bruker_id)
      VALUES (?, ?, ?)
      `,
      [innhold, articleId, req.user!.id]
    );

    res.status(201).json({ message: "Kommentar opprettet" });
  } catch (err) {
    console.error("POST COMMENT ERROR:", err);
    res.status(500).json({ message: "Serverfeil" });
  }
});


/* =======================
   POST /articles
   Beskyttet – opprett artikkel
======================= */
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const { tittel, brodtekst, kategori } = req.body || {};

  if (!tittel || !brodtekst || !kategori) {
    return res.status(400).json({ message: "Manglende data" });
  }

  try {
    await pool.execute(
      `
      INSERT INTO artikler (tittel, brodtekst, kategori, innsendt_av)
      VALUES (?, ?, ?, ?)
      `,
      [tittel, brodtekst, kategori, req.user!.id]
    );

    res.status(201).json({ message: "Artikkel opprettet" });
  } catch (err) {
    console.error("POST ARTICLE ERROR:", err);
    res.status(500).json({ message: "Serverfeil" });
  }
});

/* =======================
   PUT /articles/:id
   Beskyttet – rediger egen artikkel
======================= */
router.put("/:id", requireAuth, async (req: AuthRequest, res) => {
  const articleId = Number(req.params.id);
  const { tittel, brodtekst, kategori } = req.body || {};

  if (!tittel || !brodtekst || !kategori) {
    return res.status(400).json({ message: "Manglende data" });
  }

  try {
    const [rows]: any = await pool.execute(
      "SELECT innsendt_av FROM artikler WHERE id = ?",
      [articleId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Artikkel ikke funnet" });
    }

    if (rows[0].innsendt_av !== req.user!.id) {
      return res.status(403).json({ message: "Ikke tilgang til ressursen" });
    }

    await pool.execute(
      `
      UPDATE artikler
      SET tittel = ?, brodtekst = ?, kategori = ?
      WHERE id = ?
      `,
      [tittel, brodtekst, kategori, articleId]
    );

    res.json({ message: "Artikkel oppdatert" });
  } catch (err) {
    console.error("PUT ARTICLE ERROR:", err);
    res.status(500).json({ message: "Serverfeil" });
  }
});

/* =======================
   DELETE /articles/:id
   Beskyttet – slett egen artikkel
======================= */
router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const articleId = Number(req.params.id);

  if (!Number.isInteger(articleId)) {
    return res.status(400).json({ message: "Ugyldig id" });
  }

  try {
    const [rows]: any = await pool.execute(
      "SELECT innsendt_av FROM artikler WHERE id = ?",
      [articleId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Artikkel ikke funnet" });
    }

    if (rows[0].innsendt_av !== req.user!.id) {
      return res.status(403).json({ message: "Du kan kun slette egne artikler" });
    }

    await pool.execute("DELETE FROM artikler WHERE id = ?", [articleId]);

    res.json({ message: "Artikkel slettet" });
  } catch (err) {
    console.error("DELETE ARTICLE ERROR:", err);
    res.status(500).json({ message: "Serverfeil" });
  }
});

export default router;
