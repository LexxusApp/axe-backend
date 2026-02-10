const express = require("express");
const router = express.Router();

const {
  createAppointment,
  listMyAppointments,
  finishAppointment,
} = require("../controllers/appointmentController");

// mesmo auth dos services
function requireAuth(req, res, next) {
  const id = req.header("x-user-id");
  const role = req.header("x-user-role");

  if (!id) return res.status(401).json({ error: "Header x-user-id ausente." });
  if (!role) return res.status(401).json({ error: "Header x-user-role ausente." });

  req.user = { id, role };
  next();
}

router.use(requireAuth);

// cliente cria
router.post("/", createAppointment);

// cliente ou sacerdote lista os seus
router.get("/me", listMyAppointments);

// sacerdote finaliza
router.patch("/:id/finish", finishAppointment);

module.exports = router;
