const bcrypt = require("bcryptjs");
const { pool } = require("../db");

<<<<<<< HEAD
<<<<<<< HEAD
=======
<<<<<<< HEAD
const users = [];

function publicUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
=======
>>>>>>> 24ab9b4 (fix: aceitar invitationCode ou inviteCode no cadastro de sacerdote)
=======
>>>>>>> 408410d (fix: convite sacerdote + debug env + normalize invite code)
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> bb273ab (use postgres for auth users)
>>>>>>> 24ab9b4 (fix: aceitar invitationCode ou inviteCode no cadastro de sacerdote)
=======
}

/**
 * Normaliza removendo QUALQUER whitespace (espaço, \n, \r, \t etc.)
 * e padroniza em maiúsculas.
 * Isso resolve Railway env com caractere invisível.
 */
function normalizeInviteCode(value) {
  return String(value || "")
    .replace(/\s+/g, "") // remove todo whitespace (inclui quebras de linha)
    .toUpperCase();
>>>>>>> 408410d (fix: convite sacerdote + debug env + normalize invite code)
}

exports.registerClient = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body || {};
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: "Preencha todos os campos." });
    }

<<<<<<< HEAD
<<<<<<< HEAD
    const emailLower = String(email).toLowerCase().trim();

    const exists = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [emailLower]
    );

    if (exists.rowCount) {
=======
<<<<<<< HEAD
    const exists = users.find(
      (u) => u.email.toLowerCase() === String(email).toLowerCase()
    );
    if (exists) {
=======
=======
>>>>>>> 408410d (fix: convite sacerdote + debug env + normalize invite code)
    const emailLower = String(email).toLowerCase().trim();

    const exists = await pool.query("SELECT id FROM users WHERE email = $1", [
      emailLower,
    ]);
    if (exists.rowCount) {
<<<<<<< HEAD
>>>>>>> bb273ab (use postgres for auth users)
>>>>>>> 24ab9b4 (fix: aceitar invitationCode ou inviteCode no cadastro de sacerdote)
      return res.status(409).json({ error: 'E-mail já cadastrado.' });
=======
      return res.status(409).json({ error: "E-mail já cadastrado." });
>>>>>>> 408410d (fix: convite sacerdote + debug env + normalize invite code)
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const id = `c-${Date.now()}`;
    const avatar = `https://i.pravatar.cc/150?u=${encodeURIComponent(emailLower)}`;

<<<<<<< HEAD
<<<<<<< HEAD
=======
<<<<<<< HEAD
    users.push(user);
    return res.status(201).json({ user: publicUser(user) });
  } catch {
=======
>>>>>>> 24ab9b4 (fix: aceitar invitationCode ou inviteCode no cadastro de sacerdote)
=======
>>>>>>> 408410d (fix: convite sacerdote + debug env + normalize invite code)
    const result = await pool.query(
      `INSERT INTO users (id, name, email, phone, role, avatar, password_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, name, email, phone, role, avatar, sacerdote_id`,
      [
        id,
        String(name).trim(),
        emailLower,
        String(phone).trim(),
        "client",
        avatar,
        passwordHash,
      ]
    );

    return res.status(201).json({ user: publicUser(result.rows[0]) });
  } catch (err) {
    console.error(err);
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> bb273ab (use postgres for auth users)
>>>>>>> 24ab9b4 (fix: aceitar invitationCode ou inviteCode no cadastro de sacerdote)
    return res.status(500).json({ error: 'Erro interno ao cadastrar cliente.' });
=======
    return res.status(500).json({ error: "Erro interno ao cadastrar cliente." });
>>>>>>> 408410d (fix: convite sacerdote + debug env + normalize invite code)
  }
};

exports.registerSacerdote = async (req, res) => {
  try {
<<<<<<< HEAD
    const { name, email, phone, password, invitationCode, inviteCode } = req.body || {};
const code = invitationCode || inviteCode;
<<<<<<< HEAD

if (!code) {
  return res.status(400).json({ error: 'Código de convite é obrigatório.' });
}
=======
>>>>>>> 24ab9b4 (fix: aceitar invitationCode ou inviteCode no cadastro de sacerdote)
=======
    const { name, email, phone, password } = req.body || {};
>>>>>>> 408410d (fix: convite sacerdote + debug env + normalize invite code)

    // aceita vários nomes para não quebrar front antigo
    const rawCode =
      req.body?.inviteCode ??
      req.body?.invitationCode ??
      req.body?.codigoSacerdote ??
      "";

    const received = normalizeInviteCode(rawCode);
    const expectedRaw = process.env.SACERDOTE_INVITE_CODE;
    const expected = normalizeInviteCode(expectedRaw);

    // logs úteis (pode remover depois)
    console.log("REGISTER SACERDOTE HIT ✅");
    console.log("BODY:", req.body);
    console.log("ENV RAW:", JSON.stringify(expectedRaw));     // mostra se tem \n, espaço etc
    console.log("EXPECTED:", JSON.stringify(expected));       // já normalizado
    console.log("RECEIVED:", JSON.stringify(received));       // já normalizado

    if (!received) {
      return res.status(400).json({ error: "Código de convite é obrigatório." });
    }

    // Se o env não está configurado no servidor, o erro fica claro
    if (!expected) {
      return res.status(500).json({
        error:
          "SACERDOTE_INVITE_CODE não está configurado no servidor. Configure no Railway e reinicie o serviço.",
      });
    }

    // Convite inválido (melhor 400/403 do que 401)
    if (received !== expected) {
      return res.status(400).json({ error: "Código de convite inválido." });
    }

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: "Preencha todos os campos." });
    }

<<<<<<< HEAD
<<<<<<< HEAD
    const emailLower = String(email).toLowerCase().trim();

    const exists = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [emailLower]
    );

    if (exists.rowCount) {
=======
<<<<<<< HEAD
    const exists = users.find(
      (u) => u.email.toLowerCase() === String(email).toLowerCase()
    );
    if (exists) {
=======
=======
>>>>>>> 408410d (fix: convite sacerdote + debug env + normalize invite code)
    const emailLower = String(email).toLowerCase().trim();

    const exists = await pool.query("SELECT id FROM users WHERE email = $1", [
      emailLower,
    ]);
    if (exists.rowCount) {
<<<<<<< HEAD
>>>>>>> bb273ab (use postgres for auth users)
>>>>>>> 24ab9b4 (fix: aceitar invitationCode ou inviteCode no cadastro de sacerdote)
      return res.status(409).json({ error: 'E-mail já cadastrado.' });
=======
      return res.status(409).json({ error: "E-mail já cadastrado." });
>>>>>>> 408410d (fix: convite sacerdote + debug env + normalize invite code)
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const id = `s-${Date.now()}`;
    const sacerdoteId = `sac-${Date.now()}`;
    const avatar = `https://i.pravatar.cc/150?u=${encodeURIComponent(emailLower)}`;

<<<<<<< HEAD
<<<<<<< HEAD
=======
<<<<<<< HEAD
    users.push(user);
    return res.status(201).json({ user: publicUser(user) });
  } catch {
=======
>>>>>>> 24ab9b4 (fix: aceitar invitationCode ou inviteCode no cadastro de sacerdote)
=======
>>>>>>> 408410d (fix: convite sacerdote + debug env + normalize invite code)
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> bb273ab (use postgres for auth users)
>>>>>>> 24ab9b4 (fix: aceitar invitationCode ou inviteCode no cadastro de sacerdote)
    return res.status(500).json({ error: 'Erro interno ao cadastrar sacerdote.' });
=======
    return res.status(500).json({ error: "Erro interno ao cadastrar sacerdote." });
>>>>>>> 408410d (fix: convite sacerdote + debug env + normalize invite code)
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

<<<<<<< HEAD
    if (role !== 'client' && role !== 'sacerdote') {
      return res.status(400).json({ error: 'Perfil inválido.' });
    }

<<<<<<< HEAD
    const emailLower = String(email).toLowerCase().trim();

    const result = await pool.query(
      `SELECT id, name, email, phone, role, avatar, sacerdote_id, password_hash
       FROM users
       WHERE email = $1 AND role = $2
       LIMIT 1`,
      [emailLower, role]
=======
<<<<<<< HEAD
    const user = users.find(
      (u) =>
        u.email.toLowerCase() === String(email).toLowerCase() &&
        u.role === role
>>>>>>> 24ab9b4 (fix: aceitar invitationCode ou inviteCode no cadastro de sacerdote)
    );

    if (!result.rowCount) {
      return res.status(401).json({ error: 'Usuário não encontrado.' });
    }

    const userRow = result.rows[0];
    const ok = await bcrypt.compare(String(password), userRow.password_hash);

<<<<<<< HEAD
=======
    return res.json({ user: publicUser(user) });
  } catch {
=======
=======
>>>>>>> 408410d (fix: convite sacerdote + debug env + normalize invite code)
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
<<<<<<< HEAD

>>>>>>> 24ab9b4 (fix: aceitar invitationCode ou inviteCode no cadastro de sacerdote)
=======
>>>>>>> 408410d (fix: convite sacerdote + debug env + normalize invite code)
    if (!ok) {
      return res.status(401).json({ error: "Senha inválida." });
    }

    return res.json({ user: publicUser(userRow) });
  } catch (err) {
    console.error(err);
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> bb273ab (use postgres for auth users)
>>>>>>> 24ab9b4 (fix: aceitar invitationCode ou inviteCode no cadastro de sacerdote)
    return res.status(500).json({ error: 'Erro interno ao fazer login.' });
=======
    return res.status(500).json({ error: "Erro interno ao fazer login." });
>>>>>>> 408410d (fix: convite sacerdote + debug env + normalize invite code)
  }
};
