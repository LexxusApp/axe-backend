const pool = require("../db");

// Helpers
function toInt(v, fallback = null) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

exports.createService = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) return res.status(401).json({ error: "Não autenticado." });
    if (role !== "sacerdote")
      return res.status(403).json({ error: "Apenas sacerdote pode criar serviços." });

    const { title, description, priceCents, durationMinutes, category, active } = req.body || {};

    if (!title || !priceCents || !durationMinutes) {
      return res.status(400).json({ error: "title, priceCents e durationMinutes são obrigatórios." });
    }

    const price_cents = toInt(priceCents);
    const duration_minutes = toInt(durationMinutes);

    if (!Number.isFinite(price_cents) || price_cents <= 0) {
      return res.status(400).json({ error: "priceCents inválido." });
    }
    if (!Number.isFinite(duration_minutes) || duration_minutes <= 0) {
      return res.status(400).json({ error: "durationMinutes inválido." });
    }

    const result = await pool.query(
      `
      INSERT INTO services (sacerdote_id, title, description, price_cents, duration_minutes, category, active)
      VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, true))
      RETURNING id, sacerdote_id, title, description, price_cents, duration_minutes, category, active, created_at
      `,
      [userId, title, description || "", price_cents, duration_minutes, category || "", active]
    );

    return res.status(201).json({ service: result.rows[0] });
  } catch (err) {
    console.error("createService error:", err);
    return res.status(500).json({ error: "Erro ao criar serviço." });
  }
};

exports.listMyServices = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) return res.status(401).json({ error: "Não autenticado." });
    if (role !== "sacerdote")
      return res.status(403).json({ error: "Apenas sacerdote pode ver seus serviços." });

    const result = await pool.query(
      `
      SELECT id, sacerdote_id, title, description, price_cents, duration_minutes, category, active, created_at
      FROM services
      WHERE sacerdote_id = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    return res.json({ services: result.rows });
  } catch (err) {
    console.error("listMyServices error:", err);
    return res.status(500).json({ error: "Erro ao listar serviços." });
  }
};

exports.updateService = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ error: "Não autenticado." });
    if (role !== "sacerdote")
      return res.status(403).json({ error: "Apenas sacerdote pode editar serviços." });

    const { title, description, priceCents, durationMinutes, category, active } = req.body || {};

    // Pega serviço e valida dono
    const current = await pool.query(
      `SELECT id, sacerdote_id FROM services WHERE id = $1`,
      [id]
    );

    if (!current.rows.length) return res.status(404).json({ error: "Serviço não encontrado." });
    if (current.rows[0].sacerdote_id !== userId)
      return res.status(403).json({ error: "Você não pode editar um serviço de outro sacerdote." });

    const fields = [];
    const values = [];
    let idx = 1;

    if (title !== undefined) { fields.push(`title = $${idx++}`); values.push(title); }
    if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
    if (category !== undefined) { fields.push(`category = $${idx++}`); values.push(category); }
    if (active !== undefined) { fields.push(`active = $${idx++}`); values.push(!!active); }

    if (priceCents !== undefined) {
      const v = toInt(priceCents);
      if (!Number.isFinite(v) || v <= 0) return res.status(400).json({ error: "priceCents inválido." });
      fields.push(`price_cents = $${idx++}`); values.push(v);
    }

    if (durationMinutes !== undefined) {
      const v = toInt(durationMinutes);
      if (!Number.isFinite(v) || v <= 0) return res.status(400).json({ error: "durationMinutes inválido." });
      fields.push(`duration_minutes = $${idx++}`); values.push(v);
    }

    if (!fields.length) return res.status(400).json({ error: "Nada para atualizar." });

    values.push(id);

    const result = await pool.query(
      `
      UPDATE services
      SET ${fields.join(", ")}
      WHERE id = $${idx}
      RETURNING id, sacerdote_id, title, description, price_cents, duration_minutes, category, active, created_at
      `,
      values
    );

    return res.json({ service: result.rows[0] });
  } catch (err) {
    console.error("updateService error:", err);
    return res.status(500).json({ error: "Erro ao atualizar serviço." });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ error: "Não autenticado." });
    if (role !== "sacerdote")
      return res.status(403).json({ error: "Apenas sacerdote pode excluir serviços." });

    const current = await pool.query(
      `SELECT id, sacerdote_id FROM services WHERE id = $1`,
      [id]
    );

    if (!current.rows.length) return res.status(404).json({ error: "Serviço não encontrado." });
    if (current.rows[0].sacerdote_id !== userId)
      return res.status(403).json({ error: "Você não pode excluir um serviço de outro sacerdote." });

    await pool.query(`DELETE FROM services WHERE id = $1`, [id]);

    return res.json({ ok: true });
  } catch (err) {
    console.error("deleteService error:", err);
    return res.status(500).json({ error: "Erro ao excluir serviço." });
  }
};
