const express = require("express");
const router = express.Router();

const { login, registerClient, registerSacerdote } = require("../controllers/authController");

// Debug pra confirmar deploy/env no Railway
router.get("/debug", (req, res) => {
  res.json({
    ok: true,
    service: "axe-backend",
    node_env: process.env.NODE_ENV || null,
    has_invite_env: Boolean(process.env.SACERDOTE_INVITE_CODE),
    timestamp: new Date().toISOString(),
  });
});

router.post("/login", login);
router.post("/register/client", registerClient);
router.post("/register/sacerdote", registerSacerdote);

module.exports = router;
