const bcrypt = require('bcryptjs');
const { pool } = require('../db');

<<<<<<< HEAD
=======
<<<<<<< HEAD
const users = [];

function publicUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
=======
>>>>>>> 24ab9b4 (fix: aceitar invitationCode ou inviteCode no cadastro de sacerdote)
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
=======
>>>>>>> bb273ab (use postgres for auth users)
>>>>>>> 24ab9b4 (fix: aceitar invitationCode ou inviteCode no cadastro de sacerdote)
}

exports.registerClient = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body || {};
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos.' });
    }

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
    const emailLower = String(email).toLowerCase().trim();

    const exists = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [emailLower]
    );

    if (exists.rowCount) {
>>>>>>> bb273ab (use postgres for auth users)
>>>>>>> 24ab9b4 (fix: aceitar invitationCode ou inviteCode no cadastro de sacerdote)
      return res.status(409).json({ error: 'E-mail já cadastrado.' });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const id = `c-${Date.now()}`;
    const avatar = `https://i.pravatar.cc/150?u=${encodeURIComponent(emailLower)}`;

<<<<<<< HEAD
=======
<<<<<<< HEAD
    users.push(user);
    return res.status(201).json({ user: publicUser(user) });
  } catch {
=======
>>>>>>> 24ab9b4 (fix: aceitar invitationCode ou inviteCode no cadastro de sacerdote)
    const result = await pool.query(
      `INSERT INTO users (id, name, email, phone, role, avatar, password_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, name, email, phone, role, avatar, sacerdote_id`,
      [id, String(name), emailLower, String(phone), 'client', avatar, passwordHash]
    );

    return res.status(201).json({ user: publicUser(result.rows[0]) });
  } catch (err) {
    console.error(err);
<<<<<<< HEAD
=======
>>>>>>> bb273ab (use postgres for auth users)
>>>>>>> 24ab9b4 (fix: aceitar invitationCode ou inviteCode no cadastro de sacerdote)
    return res.status(500).json({ error: 'Erro interno ao cadastrar cliente.' });
  }
};

exports.registerSacerdote = async (req, res) => {
  try {
    const { name, email, phone, password, invitationCode, inviteCode } = req.body || {};
const code = invitationCode || inviteCode;
<<<<<<< HEAD

if (!code) {
  return res.status(400).json({ error: 'Código de convite é obrigatório.' });
}
=======
>>>>>>> 24ab9b4 (fix: aceitar invitationCode ou inviteCode no cadastro de sacerdote)

if (!code) {
  return res.status(400).json({ error: 'Código de convite é obrigatório.' });
}
  
    const expectedCode = process.env.SACERDOTE_INVITE_CODE || 'AXE-2026';
    if (String(invitationCode).trim() !== String(expectedCode).trim()) {
      return res.status(401).json({ error: 'Código de convite inválido.' });
    }

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos.' });
    }

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
    const emailLower = String(email).toLowerCase().trim();

    const exists = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [emailLower]
    );

    if (exists.rowCount) {
>>>>>>> bb273ab (use postgres for auth users)
>>>>>>> 24ab9b4 (fix: aceitar invitationCode ou inviteCode no cadastro de sacerdote)
      return res.status(409).json({ error: 'E-mail já cadastrado.' });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const id = `s-${Date.now()}`;
    const sacerdoteId = `sac-${Date.now()}`;
    const avatar = `https://i.pravatar.cc/150?u=${encodeURIComponent(emailLower)}`;

<<<<<<< HEAD
=======
<<<<<<< HEAD
    users.push(user);
    return res.status(201).json({ user: publicUser(user) });
  } catch {
=======
>>>>>>> 24ab9b4 (fix: aceitar invitationCode ou inviteCode no cadastro de sacerdote)
    const result = await pool.query(
      `INSERT INTO users (id, name, email, phone, role, avatar, sacerdote_id, password_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id, name, email, phone, role, avatar, sacerdote_id`,
      [id, String(name), emailLower, String(phone), 'sacerdote', avatar, sacerdoteId, passwordHash]
    );

    return res.status(201).json({ user: publicUser(result.rows[0]) });
  } catch (err) {
    console.error(err);
<<<<<<< HEAD
=======
>>>>>>> bb273ab (use postgres for auth users)
>>>>>>> 24ab9b4 (fix: aceitar invitationCode ou inviteCode no cadastro de sacerdote)
    return res.status(500).json({ error: 'Erro interno ao cadastrar sacerdote.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body || {};

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Informe e-mail, senha e perfil.' });
    }

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
    const emailLower = String(email).toLowerCase().trim();

    const result = await pool.query(
      `SELECT id, name, email, phone, role, avatar, sacerdote_id, password_hash
       FROM users
       WHERE email = $1 AND role = $2
       LIMIT 1`,
      [emailLower, role]
    );

    if (!result.rowCount) {
      return res.status(401).json({ error: 'Usuário não encontrado.' });
    }

    const userRow = result.rows[0];
    const ok = await bcrypt.compare(String(password), userRow.password_hash);

>>>>>>> 24ab9b4 (fix: aceitar invitationCode ou inviteCode no cadastro de sacerdote)
    if (!ok) {
      return res.status(401).json({ error: 'Senha inválida.' });
    }

    return res.json({ user: publicUser(userRow) });
  } catch (err) {
    console.error(err);
<<<<<<< HEAD
=======
>>>>>>> bb273ab (use postgres for auth users)
>>>>>>> 24ab9b4 (fix: aceitar invitationCode ou inviteCode no cadastro de sacerdote)
    return res.status(500).json({ error: 'Erro interno ao fazer login.' });
  }
};
