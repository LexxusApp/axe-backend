const express = require('express');
const router = express.Router();

const {
  login,
  registerClient,
  registerSacerdote,
} = require('../controllers/authController');

router.post('/login', login);
router.post('/register/client', registerClient);
router.post('/register/sacerdote', registerSacerdote);

module.exports = router;
