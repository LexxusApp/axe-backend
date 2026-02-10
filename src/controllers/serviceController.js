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

exports.createService = async (req, res) => {
  try {
    if (!mustBeSacerdote(req, res)) return;

    const { name, description, price, durationMin } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Informe o nome do serviço." });
    }

    const id = `sv-${Date.now()}`;
    const sacerdoteId = req.user.id;

    await pool.query(
      `
      INSERT INTO services (id, sacerdote_id, name, description, price, duration_min)
      VALUES ($1,$2,$3,$4,$5,$6)
      `,
      [
        id,
        sacerdoteId,
        String(name).trim(),
        description ? String(description).trim() : null,
        price !== undefined && price !== null && String(price).trim() !== "" ? Number(price) : null,
        durationMin !== undefined && durationMin !== null && String(durationMin).trim() !== "" ? Number(durationMin) : null,
      ]
    );

    return res.status(201).json({ ok: true, id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao criar serviço." });
  }
};

exports.listMyServices = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: "Não autenticado." });

    const userId = req.user.id;

    // sacerdote lista os dele; (se um dia quiser client ver catálogo, faz outra rota)
    if (req.user.role !== "sacerdote") {
      return res.status(403).json({ error: "Apenas sacerdote pode listar seus serviços." });
    }

    const result = await pool.query(
      `
      SELECT id, name, description, price, duration_min, active, created_at
      FROM services
      WHERE sacerdote_id = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    const services = result.rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description || undefined,
      price: r.price !== null && r.price !== undefined ? Number(r.price) : undefined,
      durationMin: r.duration_min !== null && r.duration_min !== undefined ? Number(r.duration_min) : undefined,
      active: r.active !== false,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
    }));

    return res.json({ services });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao listar serviços." });
  }
};

exports.updateService = async (req, res) => {
  try {
    if (!mustBeSacerdote(req, res)) return;

    const serviceId = String(req.params?.id || "").trim();
    if (!serviceId) return res.status(400).json({ error: "ID inválido." });

    const { name, description, price, durationMin, active } = req.body || {};

    const upd = await pool.query(
      `
      UPDATE services
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        price = $3,
        duration_min = $4,
        active = COALESCE($5, active)
      WHERE id = $6 AND sacerdote_id = $7
      RETURNING id
      `,
      [
        name !== undefined ? String(name).trim() : null,
        description !== undefined ? String(description).trim() : null,
        price !== undefined && price !== null && String(price).trim() !== "" ? Number(price) : null,
        durationMin !== undefined && durationMin !== null && String(durationMin).trim() !== "" ? Number(durationMin) : null,
        typeof active === "boolean" ? active : null,
        serviceId,
        req.user.id,
      ]
    );

    if (!upd.rowCount) return res.status(404).json({ error: "Serviço não encontrado." });

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
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
    console.error(err);
    return res.status(500).json({ error: "Erro ao deletar serviço." });
  }
};
