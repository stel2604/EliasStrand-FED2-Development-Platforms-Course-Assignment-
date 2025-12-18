import { app } from "./app";

// TODO: Bruk process.env.PORT i produksjon
const port = 3000;

/* =======================
   Start Express-server
======================= */
app.listen(port, () => {
  console.log(`API kjører på http://localhost:${port}`);
});
