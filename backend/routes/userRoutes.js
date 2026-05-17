const express = require('express');
const router = express.Router();
const { getUsers, updateProfile } = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, admin, getUsers);
router.put('/profile', protect, updateProfile);

module.exports = router;
