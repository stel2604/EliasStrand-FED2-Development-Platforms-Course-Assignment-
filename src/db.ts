import mysql from "mysql2/promise";

// TODO: Flytt database-konfigurasjon til .env før produksjon
export const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "acg635241",
  database: "dev_platforms_news",
  connectionLimit: 10,
});
