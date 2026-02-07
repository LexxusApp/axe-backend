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
<<<<<<< HEAD

const PORT = process.env.PORT || 3333;
=======

const PORT = process.env.PORT || 3333;
<<<<<<< HEAD
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔥 Backend rodando na porta ${PORT}`);
});

=======
>>>>>>> 24ab9b4 (fix: aceitar invitationCode ou inviteCode no cadastro de sacerdote)

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
<<<<<<< HEAD
=======
>>>>>>> bb273ab (use postgres for auth users)
>>>>>>> 24ab9b4 (fix: aceitar invitationCode ou inviteCode no cadastro de sacerdote)
