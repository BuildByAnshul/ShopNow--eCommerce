const express = require('express');
const { register, verifyEmail, login, logout, getMe, addAddress, googleLogin, updateProfile, forgotPassword, verifyOTP, resetPassword, getAllUsers, updateUserRole, deleteUser } = require('../controllers/authController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/addresses', protect, addAddress);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

// Admin user management routes
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);
router.delete('/users/:id', protect, admin, deleteUser);

module.exports = router;
