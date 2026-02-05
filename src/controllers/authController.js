const bcrypt = require('bcryptjs');

// "banco" temporário em memória
const users = [];

// convite sacerdote
const SACERDOTE_INVITE_CODE = process.env.SACERDOTE_INVITE_CODE || 'AXE-2026';

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

async function registerClient(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email e password são obrigatórios' });
    }

    const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return res.status(409).json({ error: 'Este email já está cadastrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = {
      id: `u-${Date.now()}`,
      name,
      email,
      role: 'client',
      avatar: 'https://picsum.photos/seed/client/100/100',
      passwordHash,
    };

    users.push(newUser);

    return res.status(201).json({
      message: 'Cliente cadastrado com sucesso',
      user: sanitizeUser(newUser),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro no cadastro do cliente' });
  }
}

async function registerSacerdote(req, res) {
  try {
    const { name, email, password, inviteCode } = req.body;

    if (!name || !email || !password || !inviteCode) {
      return res.status(400).json({ error: 'name, email, password e inviteCode são obrigatórios' });
    }

    if (inviteCode !== SACERDOTE_INVITE_CODE) {
      return res.status(401).json({ error: 'Código de convite inválido' });
    }

    const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return res.status(409).json({ error: 'Este email já está cadastrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = {
      id: `s-${Date.now()}`,
      name,
      email,
      role: 'sacerdote',
      sacerdoteId: `sac-${Date.now()}`,
      avatar: 'https://picsum.photos/seed/sacerdote/100/100',
      passwordHash,
    };

    users.push(newUser);

    return res.status(201).json({
      message: 'Sacerdote cadastrado com sucesso',
      user: sanitizeUser(newUser),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro no cadastro do sacerdote' });
  }
}

async function login(req, res) {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'email, password e role são obrigatórios' });
    }

    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.role === role
    );

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Senha inválida' });
    }

    return res.json({
      message: 'Login ok',
      user: sanitizeUser(user),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro no login' });
  }
}

module.exports = {
  registerClient,
  registerSacerdote,
  login,
};
