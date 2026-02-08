require("dotenv").config();
const { Pool } = require("pg");

const hasDbUrl = !!process.env.DATABASE_URL;

const pool = new Pool(
  hasDbUrl
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, // Railway costuma precisar
      }
    : {
        host: process.env.PGHOST,
        port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD, // <- NÃO pode ser undefined
        database: process.env.PGDATABASE,
      }
);

// ajuda a enxergar o erro real quando faltar env
if (!hasDbUrl && !process.env.PGPASSWORD) {
  console.warn("⚠️ PGPASSWORD não está definido no .env (isso causa o erro SASL).");
}

module.exports = { pool };
