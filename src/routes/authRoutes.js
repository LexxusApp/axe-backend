const express = require('express');
const router = express.Router();

const {
  registerClient,
  registerSacerdote,
  login,
} = require('../controllers/authController');

router.post('/register-client', registerClient);
router.post('/register-sacerdote', registerSacerdote);
router.post('/login', login);

module.exports = router;
