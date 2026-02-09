const bcrypt = require("bcryptjs");
const { pool } = require("../db");

function publicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    avatar: row.avatar,
    sacerdoteId: row.sacerdote_id || undefined,
  };
}

// remove QUALQUER whitespace (inclui \n \r \t espaço) e padroniza
function normalizeInviteCode(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .toUpperCase();
}

exports.registerClient = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body || {};
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: "Preencha todos os campos." });
    }

    const emailLower = String(email).toLowerCase().trim();

    const exists = await pool.query("SELECT id FROM users WHERE email = $1", [emailLower]);
    if (exists.rowCount) {
      return res.status(409).json({ error: "E-mail já cadastrado." });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const id = `c-${Date.now()}`;
    const avatar = `https://i.pravatar.cc/150?u=${encodeURIComponent(emailLower)}`;

    const result = await pool.query(
      `INSERT INTO users (id, name, email, phone, role, avatar, password_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, name, email, phone, role, avatar, sacerdote_id`,
      [id, String(name).trim(), emailLower, String(phone).trim(), "client", avatar, passwordHash]
    );

    return res.status(201).json({ user: publicUser(result.rows[0]) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno ao cadastrar cliente." });
  }
};

exports.registerSacerdote = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body || {};

    // aceita vários nomes (compatível com front antigo/novo)
    const rawCode =
      req.body?.inviteCode ??
      req.body?.invitationCode ??
      req.body?.codigoSacerdote ??
      "";

    const received = normalizeInviteCode(rawCode);
    const expectedRaw = process.env.SACERDOTE_INVITE_CODE;
    const expected = normalizeInviteCode(expectedRaw);

    console.log("REGISTER SACERDOTE HIT ✅");
    console.log("BODY:", req.body);
    console.log("ENV RAW:", JSON.stringify(expectedRaw));
    console.log("EXPECTED:", JSON.stringify(expected));
    console.log("RECEIVED:", JSON.stringify(received));

    if (!received) {
      return res.status(400).json({ error: "Código de convite é obrigatório." });
    }

    if (!expected) {
      return res.status(500).json({
        error: "SACERDOTE_INVITE_CODE não configurado no servidor.",
      });
    }

    // convite inválido -> 400 (não 401)
    if (received !== expected) {
      return res.status(400).json({ error: "Código de convite inválido." });
    }

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: "Preencha todos os campos." });
    }

    const emailLower = String(email).toLowerCase().trim();

    const exists = await pool.query("SELECT id FROM users WHERE email = $1", [emailLower]);
    if (exists.rowCount) {
      return res.status(409).json({ error: "E-mail já cadastrado." });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const id = `s-${Date.now()}`;
    const sacerdoteId = `sac-${Date.now()}`;
    const avatar = `https://i.pravatar.cc/150?u=${encodeURIComponent(emailLower)}`;

    const result = await pool.query(
      `INSERT INTO users (id, name, email, phone, role, avatar, sacerdote_id, password_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id, name, email, phone, role, avatar, sacerdote_id`,
      [
        id,
        String(name).trim(),
        emailLower,
        String(phone).trim(),
        "sacerdote",
        avatar,
        sacerdoteId,
        passwordHash,
      ]
    );

    return res.status(201).json({ user: publicUser(result.rows[0]) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno ao cadastrar sacerdote." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body || {};

    if (!email || !password || !role) {
      return res.status(400).json({ error: "Informe e-mail, senha e perfil." });
    }
    if (role !== "client" && role !== "sacerdote") {
      return res.status(400).json({ error: "Perfil inválido." });
    }

    const emailLower = String(email).toLowerCase().trim();

    const result = await pool.query(
      `SELECT id, name, email, phone, role, avatar, sacerdote_id, password_hash
       FROM users
       WHERE email = $1 AND role = $2
       LIMIT 1`,
      [emailLower, role]
    );

    if (!result.rowCount) {
      return res.status(401).json({ error: "Usuário não encontrado." });
    }

    const userRow = result.rows[0];
    const ok = await bcrypt.compare(String(password), userRow.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Senha inválida." });
    }

    return res.json({ user: publicUser(userRow) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno ao fazer login." });
  }
};
