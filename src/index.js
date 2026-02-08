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

// ✅ cria tabela se não existir (e prepara extensões úteis)
async function ensureDb() {
  // opcional, mas recomendado se você usar gen_random_uuid() em outras tabelas
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

  // (Opcional) índice para acelerar login por email+role
  await pool.query(`
    CREATE INDEX IF NOT EXISTS users_email_role_idx
    ON users (email, role);
  `);
}
<<<<<<< HEAD

const PORT = process.env.PORT || 3333;
=======

const PORT = process.env.PORT || 3333;

<<<<<<< HEAD
=======
>>>>>>> 24ab9b4 (fix: aceitar invitationCode ou inviteCode no cadastro de sacerdote)

ensureDb()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
=======
// ✅ Sobe o servidor só depois do DB estar ok
(async () => {
  try {
    await ensureDb();
    app.listen(PORT, "0.0.0.0", () => {
>>>>>>> 408410d (fix: convite sacerdote + debug env + normalize invite code)
      console.log(`🔥 Backend rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Falha ao preparar DB:", err);
    process.exit(1);
<<<<<<< HEAD
  });
<<<<<<< HEAD
=======
>>>>>>> bb273ab (use postgres for auth users)
>>>>>>> 24ab9b4 (fix: aceitar invitationCode ou inviteCode no cadastro de sacerdote)
=======
  }
})();
>>>>>>> 408410d (fix: convite sacerdote + debug env + normalize invite code)
