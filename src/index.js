require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { pool } = require("./db");
const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Axé Agendado rodando");
});

app.use("/auth", authRoutes);
app.use("/services", serviceRoutes);

async function ensureDb() {
  await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      role TEXT NOT NULL CHECK (role IN ('client','sacerdote')),
      avatar TEXT,
      sacerdote_id TEXT,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS users_email_role_idx
    ON users (email, role);
  `);
}

const PORT = process.env.PORT || 3333;

(async () => {
  try {
    await ensureDb();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🔥 Backend rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Falha ao preparar DB:", err);
    process.exit(1);
  }
})();
