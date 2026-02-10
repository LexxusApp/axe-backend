require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { pool } = require("./db");
const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Axé Agendado rodando");
});

app.use("/auth", authRoutes);
app.use("/services", serviceRoutes);
app.use("/appointments", appointmentRoutes);

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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      sacerdote_id TEXT NOT NULL,
      service_id TEXT NOT NULL,
      service_name TEXT,
      city TEXT,
      date_at TIMESTAMP NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('open','done')),
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS appointments_sacerdote_status_idx
    ON appointments (sacerdote_id, status, date_at);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS appointments_client_idx
    ON appointments (client_id, date_at);
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
