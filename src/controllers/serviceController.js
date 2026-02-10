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

/* =========================
   CREATE
========================= */
exports.createService = async (req, res) => {
  try {
    if (!mustBeSacerdote(req, res)) return;

    const { name, description, price, durationMin, category } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Informe o nome do serviço." });
    }

    const id = `sv-${Date.now()}`;
    const sacerdoteId = req.user.id;

    await pool.query(
      `
      INSERT INTO services
        (id, sacerdote_id, title, description, price_cents, duration_minutes, category, active)
      VALUES
        ($1,$2,$3,$4,$5,$6,$7,true)
      `,
      [
        id,
        sacerdoteId,
        String(name).trim(),
        description ? String(description).trim() : null,
        typeof price === "number" ? Math.round(price * 100) : null,
        typeof durationMin === "number" ? durationMin : null,
        category || null,
      ]
    );

    return res.status(201).json({ ok: true, id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao criar serviço." });
  }
};

/* =========================
   LIST MY SERVICES
========================= */
exports.listMyServices = async (req, res) => {
  try {
    if (!mustBeSacerdote(req, res)) return;

    const result = await pool.query(
      `
      SELECT
        id,
        title,
        description,
        price_cents,
        duration_minutes,
        active,
        created_at
      FROM services
      WHERE sacerdote_id = $1
      ORDER BY created_at DESC
      `,
      [req.user.id]
    );

    const services = result.rows.map((r) => ({
      id: r.id,
      name: r.title,
      description: r.description || undefined,
      price: r.price_cents != null ? r.price_cents / 100 : undefined,
      durationMin: r.duration_minutes ?? undefined,
      active: r.active !== false,
      createdAt: r.created_at,
    }));

    return res.json({ services });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao listar serviços." });
  }
};

/* =========================
   UPDATE
========================= */
exports.updateService = async (req, res) => {
  try {
    if (!mustBeSacerdote(req, res)) return;

    const serviceId = String(req.params.id || "").trim();
    if (!serviceId) return res.status(400).json({ error: "ID inválido." });

    const { name, description, price, durationMin, active } = req.body || {};

    const upd = await pool.query(
      `
      UPDATE services
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        price_cents = COALESCE($3, price_cents),
        duration_minutes = COALESCE($4, duration_minutes),
        active = COALESCE($5, active)
      WHERE id = $6 AND sacerdote_id = $7
      RETURNING id
      `,
      [
        name !== undefined ? String(name).trim() : null,
        description !== undefined ? String(description).trim() : null,
        typeof price === "number" ? Math.round(price * 100) : null,
        typeof durationMin === "number" ? durationMin : null,
        typeof active === "boolean" ? active : null,
        serviceId,
        req.user.id,
      ]
    );

    if (!upd.rowCount) {
      return res.status(404).json({ error: "Serviço não encontrado." });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao atualizar serviço." });
  }
};

/* =========================
   DELETE
========================= */
exports.deleteService = async (req, res) => {
  try {
    if (!mustBeSacerdote(req, res)) return;

    const serviceId = String(req.params.id || "").trim();
    if (!serviceId) return res.status(400).json({ error: "ID inválido." });

    const del = await pool.query(
      `DELETE FROM services WHERE id = $1 AND sacerdote_id = $2 RETURNING id`,
      [serviceId, req.user.id]
    );

    if (!del.rowCount) {
      return res.status(404).json({ error: "Serviço não encontrado." });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao deletar serviço." });
  }
};
