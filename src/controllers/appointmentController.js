const { pool } = require("../db");

function normalizeStatus(status) {
  const s = String(status || "").trim().toLowerCase();
  if (s === "open" || s === "done") return s;
  return "";
}

exports.createAppointment = async (req, res) => {
  try {
    const { role, id: userId } = req.user || {};
    if (!userId) return res.status(401).json({ error: "Não autenticado." });

    // Cliente cria agendamento para um sacerdote
    const { sacerdoteId, serviceId, city, dateISO, notes } = req.body || {};

    if (!sacerdoteId || !serviceId || !city || !dateISO) {
      return res.status(400).json({ error: "Preencha sacerdoteId, serviceId, city e dateISO." });
    }

    const apptId = `a-${Date.now()}`;

    // pega nome do cliente
    const clientRow = await pool.query(
      `SELECT id, name FROM users WHERE id = $1 LIMIT 1`,
      [userId]
    );
    if (!clientRow.rowCount) return res.status(401).json({ error: "Usuário inválido." });

    // pega service (pra mostrar no dashboard)
    const serviceRow = await pool.query(
      `SELECT id, name FROM services WHERE id = $1 LIMIT 1`,
      [String(serviceId)]
    );
    if (!serviceRow.rowCount) return res.status(404).json({ error: "Serviço não encontrado." });

    await pool.query(
      `INSERT INTO appointments (
        id, client_id, sacerdote_id, service_id, service_name,
        city, date_at, status, notes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        apptId,
        userId,
        String(sacerdoteId),
        String(serviceId),
        String(serviceRow.rows[0].name || ""),
        String(city),
        new Date(String(dateISO)),
        "open",
        notes ? String(notes) : null,
      ]
    );

    return res.status(201).json({ ok: true, id: apptId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao criar agendamento." });
  }
};

exports.listMyAppointments = async (req, res) => {
  try {
    const { id: userId, role } = req.user || {};
    if (!userId) return res.status(401).json({ error: "Não autenticado." });

    const status = normalizeStatus(req.query?.status);

    // sacerdote vê seus agendamentos, cliente vê os dele
    let where = "";
    const params = [];
    let idx = 1;

    if (role === "sacerdote") {
      where = `WHERE a.sacerdote_id = $${idx++}`;
      params.push(userId);
    } else {
      where = `WHERE a.client_id = $${idx++}`;
      params.push(userId);
    }

    if (status) {
      where += ` AND a.status = $${idx++}`;
      params.push(status);
    }

    const result = await pool.query(
      `
      SELECT
        a.id,
        a.status,
        a.city,
        a.date_at,
        a.service_name,
        u.name as client_name
      FROM appointments a
      LEFT JOIN users u ON u.id = a.client_id
      ${where}
      ORDER BY a.date_at DESC
      `,
      params
    );

    const appointments = result.rows.map((r) => ({
      id: r.id,
      status: r.status,
      city: r.city || undefined,
      date: r.date_at ? new Date(r.date_at).toISOString() : undefined,
      serviceName: r.service_name || undefined,
      clientName: r.client_name || undefined,
    }));

    return res.json({ appointments });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao listar agendamentos." });
  }
};

exports.finishAppointment = async (req, res) => {
  try {
    const { id: userId, role } = req.user || {};
    if (!userId) return res.status(401).json({ error: "Não autenticado." });
    if (role !== "sacerdote") return res.status(403).json({ error: "Apenas sacerdote pode finalizar." });

    const apptId = String(req.params?.id || "").trim();
    if (!apptId) return res.status(400).json({ error: "ID inválido." });

    const upd = await pool.query(
      `UPDATE appointments
       SET status = 'done'
       WHERE id = $1 AND sacerdote_id = $2
       RETURNING id`,
      [apptId, userId]
    );

    if (!upd.rowCount) return res.status(404).json({ error: "Agendamento não encontrado." });

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao finalizar agendamento." });
  }
};
