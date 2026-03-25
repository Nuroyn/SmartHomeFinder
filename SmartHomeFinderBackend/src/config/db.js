// src/db.js
import pkg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

const { Pool } = pkg;

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT ? parseInt(process.env.PG_PORT) : 5433,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  ...(isProduction && {
    ssl: { rejectUnauthorized: true },
  }),
});

// simple test so you know it's alive
pool
  .query("SELECT NOW()")
  .then(() => {
    console.log("Postgres connected");
  })
  .catch(() => {
    console.error("Postgres connection failed");
  });

pool.on("error", () => {
  console.error("Unexpected error on idle client");
  process.exit(1);
});

export default pool;

