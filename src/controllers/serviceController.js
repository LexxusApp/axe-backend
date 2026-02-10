const { pool } = require("../db");

function mustBeSacerdote(req, res) {
  if (!req.user?.id) {
    res.status(401).json({ error: "Não autenticado." });
    return false;
  }
  if (req.user.role !== "sacerdote") {
    res.status(403).json({ error: "Apenas sacerdote pode gerenciar serviços." });
    return false;
  }
  return true;
}

function toIntOrNull(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

function toPriceCentsOrNull(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  if (!s) return null;

  // aceita "120", "120.5", "120,50"
  const normalized = s.replace(",", ".");
  const n = Number(normalized);
  if (!Number.isFinite(n)) return null;

  // converte reais -> centavos
  return Math.round(n * 100);
}

function centsToReais(cents) {
  if (cents === undefined || cents === null) return undefined;
  const n = Number(cents);
  if (!Number.isFinite(n)) return undefined;
  return n / 100;
}

exports.createService = async (req, res) => {
  try {
    if (!mustBeSacerdote(req, res)) return;

    const { name, description, price, durationMin, category } = req.body || {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Informe o nome do serviço." });
    }

    const id = `sv-${Date.now()}`;
    const sacerdoteId = req.user.id;

    const title = String(name).trim();
    const desc = description ? String(description).trim() : null;
    const priceCents = toPriceCentsOrNull(price);
    const durationMinutes = toIntOrNull(durationMin);
    const cat = category ? String(category).trim() : null;

    await pool.query(
      `
      INSERT INTO services (
        id,
        sacerdote_id,
        title,
        description,
        price_cents,
        duration_minutes,
        category,
        active,
        created_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,TRUE,NOW())
      `,
      [id, sacerdoteId, title, desc, priceCents, durationMinutes, cat]
    );

    return res.status(201).json({ ok: true, id });
  } catch (err) {
    console.error("createService error:", err);
    return res.status(500).json({ error: "Erro ao criar serviço." });
  }
};

exports.listMyServices = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Não autenticado." });

    if (req.user.role !== "sacerdote") {
      return res.status(403).json({ error: "Apenas sacerdote pode listar seus serviços." });
    }

    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        id,
        title,
        description,
        price_cents,
        duration_minutes,
        category,
        active,
        created_at
      FROM services
      WHERE sacerdote_id = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    const services = result.rows.map((r) => ({
      id: r.id,
      name: r.title,
      description: r.description || undefined,
      price: centsToReais(r.price_cents),
      durationMin:
        r.duration_minutes !== null && r.duration_minutes !== undefined
          ? Number(r.duration_minutes)
          : undefined,
      category: r.category || undefined,
      active: r.active !== false,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
    }));

    return res.json({ services });
  } catch (err) {
    console.error("listMyServices error:", err);
    return res.status(500).json({ error: "Erro ao listar serviços." });
  }
};

exports.updateService = async (req, res) => {
  try {
    if (!mustBeSacerdote(req, res)) return;

    const serviceId = String(req.params?.id || "").trim();
    if (!serviceId) return res.status(400).json({ error: "ID inválido." });

    const { name, description, price, durationMin, category, active } = req.body || {};

    const title = name !== undefined ? String(name).trim() : null;
    const desc = description !== undefined ? String(description).trim() : null;
    const priceCents = price !== undefined ? toPriceCentsOrNull(price) : null;
    const durationMinutes = durationMin !== undefined ? toIntOrNull(durationMin) : null;
    const cat = category !== undefined ? String(category).trim() : null;
    const activeBool = typeof active === "boolean" ? active : null;

    const upd = await pool.query(
      `
      UPDATE services
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        price_cents = COALESCE($3, price_cents),
        duration_minutes = COALESCE($4, duration_minutes),
        category = COALESCE($5, category),
        active = COALESCE($6, active)
      WHERE id = $7 AND sacerdote_id = $8
      RETURNING id
      `,
      [title, desc, priceCents, durationMinutes, cat, activeBool, serviceId, req.user.id]
    );

    if (!upd.rowCount) return res.status(404).json({ error: "Serviço não encontrado." });

    return res.json({ ok: true });
  } catch (err) {
    console.error("updateService error:", err);
    return res.status(500).json({ error: "Erro ao atualizar serviço." });
  }
};

exports.deleteService = async (req, res) => {
  try {
    if (!mustBeSacerdote(req, res)) return;

    const serviceId = String(req.params?.id || "").trim();
    if (!serviceId) return res.status(400).json({ error: "ID inválido." });

    const del = await pool.query(
      `DELETE FROM services WHERE id = $1 AND sacerdote_id = $2 RETURNING id`,
      [serviceId, req.user.id]
    );

    if (!del.rowCount) return res.status(404).json({ error: "Serviço não encontrado." });

    return res.json({ ok: true });
  } catch (err) {
    console.error("deleteService error:", err);
    return res.status(500).json({ error: "Erro ao deletar serviço." });
  }
};
