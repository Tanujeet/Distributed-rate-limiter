import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

/**
 * PostgreSQL connection pool
 * Using Neon PostgreSQL
 */
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10, // max connections in pool
});

/**
 * Test database connection
 */
db.connect()
  .then((client) => {
    console.log("✅ PostgreSQL connected");

    client.release();
  })
  .catch((err) => {
    console.error("❌ PostgreSQL connection error:", err);
  });
