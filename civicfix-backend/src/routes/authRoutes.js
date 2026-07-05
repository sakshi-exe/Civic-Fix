const express = require('express');
const { register, registerAdmin, login, getMe } = require('../controllers/authController');
const { registerValidator, registerAdminValidator, loginValidator } = require('../validators/authValidator');
const validateRequest = require('../middleware/validateRequest');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerValidator, validateRequest, register);
router.post('/register-admin', registerAdminValidator, validateRequest, registerAdmin);
router.post('/login', loginValidator, validateRequest, login);
router.get('/me', protect, getMe);

module.exports = router;
