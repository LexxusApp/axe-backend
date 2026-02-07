const { Pool } = require('pg');

const isProd = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Railway Postgres geralmente exige SSL em produção
  ssl: isProd ? { rejectUnauthorized: false } : false,
});

module.exports = { pool };
