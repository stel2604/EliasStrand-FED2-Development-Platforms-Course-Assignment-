import express from "express";
import authRoutes from "./routes/auth.routes";
import articlesRoutes from "./routes/articles.routes";
import commentsRoutes from "./routes/comments.routes";

export const app = express();

app.use(express.json());
app.use("/articles", articlesRoutes);
// så routes
app.use("/auth", authRoutes);

app.use(commentsRoutes);

app.get("/", (_req, res) => {
  res.json({ ok: true, message: "API kjører" });
});
