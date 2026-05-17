const express = require('express');
const router = express.Router();
const { register, login, getMe, deleteAccount, upgradeToAdmin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const passport = require('passport');
const jwt = require('jsonwebtoken');

router.post('/signup', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.delete('/me', protect, deleteAccount);
router.post('/upgrade', protect, upgradeToAdmin);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const token = generateToken(req.user._id);
    const isProd = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;
    const redirectBase = isProd ? '' : 'http://localhost:5173';
      
    res.redirect(`${redirectBase}/auth/callback?token=${token}`);
  }
);

module.exports = router;
