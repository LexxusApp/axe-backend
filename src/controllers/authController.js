const bcrypt = require('bcryptjs');

// "Banco" em memória (somente para MVP)
// Depois trocamos por banco real (Postgres no Railway)
const users = [];

// helper: remove senha do retorno
function publicUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}

function normalizeRole(role) {
  if (role === 'client' || role === 'sacerdote') return role;
  return null;
}

exports.registerClient = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body || {};

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos.' });
    }

    const exists = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
    if (exists) {
      return res.status(409).json({ error: 'E-mail já cadastrado.' });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const user = {
      id: `c-${Date.now()}`,
      name: String(name),
      email: String(email),
      phone: String(phone),
      role: 'client',
      avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(String(email))}`,
      passwordHash,
    };

    users.push(user);
    return res.status(201).json({ user: publicUser(user) });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno ao cadastrar cliente.' });
  }
};

exports.registerSacerdote = async (req, res) => {
  try {
    const { invitationCode, name, email, phone, password } = req.body || {};

    if (!invitationCode) {
      return res.status(400).json({ error: 'Código de convite é obrigatório.' });
    }

    const expectedCode = process.env.SACERDOTE_INVITE_CODE || 'AXE-2026';
    if (String(invitationCode).trim() !== String(expectedCode).trim()) {
      return res.status(401).json({ error: 'Código de convite inválido.' });
    }

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos.' });
    }

    const exists = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
    if (exists) {
      return res.status(409).json({ error: 'E-mail já cadastrado.' });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const user = {
      id: `s-${Date.now()}`,
      name: String(name),
      email: String(email),
      phone: String(phone),
      role: 'sacerdote',
      avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(String(email))}`,
      sacerdoteId: `s-${Date.now()}`,
      passwordHash,
    };

    users.push(user);
    return res.status(201).json({ user: publicUser(user) });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno ao cadastrar sacerdote.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body || {};

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Informe e-mail, senha e perfil.' });
    }

    const normalizedRole = normalizeRole(role);
    if (!normalizedRole) {
      return res.status(400).json({ error: 'Perfil inválido.' });
    }

    const user = users.find(
      (u) =>
        u.email.toLowerCase() === String(email).toLowerCase() &&
        u.role === normalizedRole
    );

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado.' });
    }

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Senha inválida.' });
    }

    return res.json({ user: publicUser(user) });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno ao fazer login.' });
  }
};
