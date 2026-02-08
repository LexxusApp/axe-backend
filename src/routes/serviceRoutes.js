const express = require("express");
const router = express.Router();

const {
  createService,
  listMyServices,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

// Auth simples via header (por enquanto)
function requireAuth(req, res, next) {
  const id = req.header("x-user-id");
  const role = req.header("x-user-role");

  if (!id) return res.status(401).json({ error: "Header x-user-id ausente." });
  if (!role) return res.status(401).json({ error: "Header x-user-role ausente." });

  req.user = { id, role };
  next();
}

router.use(requireAuth);

// CRUD
router.post("/", createService);        // POST /services
router.get("/me", listMyServices);      // GET /services/me
router.put("/:id", updateService);      // PUT /services/:id
router.delete("/:id", deleteService);   // DELETE /services/:id

module.exports = router;
