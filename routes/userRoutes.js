// routes/userRoutes.js
const express = require('express');
const { getUserProfile } = require('../controllers/usersController.js');
const verifyToken = require('../middlewares/middleWare.js');

const router = express.Router();

// Route: Get or create profile
router.get('/profile', verifyToken, getUserProfile);

module.exports = router;
