require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { pool } = require('./db');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Axé Agendado rodando');
});

app.use('/auth', authRoutes);

// ✅ cria tabela se não existir
async function ensureDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      role TEXT NOT NULL,
      avatar TEXT,
      sacerdote_id TEXT,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

const PORT = process.env.PORT || 3333;

ensureDb()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🔥 Backend rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Falha ao preparar DB:', err);
    process.exit(1);
  });
