const express = require("express");
const router = express.Router();

const { login, registerClient, registerSacerdote } = require("../controllers/authController");

router.post("/login", login);
router.post("/register/client", registerClient);
router.post("/register/sacerdote", registerSacerdote);

module.exports = router;
<<<<<<< HEAD
=======
<<<<<<< HEAD
module.exports = router;

=======
module.exports = router;
>>>>>>> bb273ab (use postgres for auth users)
>>>>>>> 24ab9b4 (fix: aceitar invitationCode ou inviteCode no cadastro de sacerdote)
=======
>>>>>>> 408410d (fix: convite sacerdote + debug env + normalize invite code)
