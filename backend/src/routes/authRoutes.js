const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');




// @route   POST api/auth/register
// @desc    Yeni kullanıcı kaydı (sadece öğrenci)
// @access  Public
router.post('/register', authController.register);

// @route   POST api/auth/login
// @desc    Kullanıcı girişi ve token alma
// @access  Public
router.post('/login', authController.login);




module.exports = router;