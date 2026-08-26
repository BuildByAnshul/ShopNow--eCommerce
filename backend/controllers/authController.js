const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const Session = require('../models/Session'); // Session tracking model
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// Helper to send email
const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"ShopEase Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

// @desc  Register new user
// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    let user = await User.findOne({ email });
    if (user) {
      if (user.isVerified !== false) {
        return res.status(400).json({ message: 'Email already registered.' });
      }
      // If user exists but is not verified, we update their details and resend OTP
      user.name = name;
      user.password = password; 
      await user.save();
    } else {
      user = await User.create({ name, email, password, isVerified: false });
    }

    // Generate Verification OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Clear old OTPs for this email
    await Otp.deleteMany({ email: user.email, type: 'verification' });

    await Otp.create({
      email: user.email,
      otp: otp,
      type: 'verification',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 mins
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
        <h2 style="color: #2b5a41; text-align: center;">ShopEase Email Verification</h2>
        <p style="color: #4b5563; font-size: 16px;">Hello ${user.name},</p>
        <p style="color: #4b5563; font-size: 16px;">Please verify your email address to complete your registration. Here is your One-Time Password (OTP):</p>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1a3627; border-radius: 8px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #4b5563; font-size: 14px;">This OTP is valid for 10 minutes.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Verify your Email - ShopEase',
        html,
      });
      res.status(201).json({ message: 'OTP sent to email. Please verify.', email: user.email });
    } catch (err) {
      console.error('Email error:', err);
      return res.status(500).json({ message: 'Error sending email. Please check your .env configuration.' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc  Verify Email OTP
// @route POST /api/auth/verify-email
const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const otpRecord = await Otp.findOne({ email, otp, type: 'verification' });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isVerified = true;
    await user.save();

    await Otp.deleteMany({ email, type: 'verification' });

    res.status(200).json({
      message: 'Email verified successfully',
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      addresses: user.addresses || [],
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Login user
// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.isVerified === false) {
      return res.status(403).json({ message: 'Please verify your email first', notVerified: true, email: user.email });
    }

    const token = generateToken(user._id);

    // --- Create Active Session Document ---
    await Session.create({
      userId: user._id,
      token,
      ip: req.ip || req.headers['x-forwarded-for'] || '',
      device: req.headers['user-agent'] || '',
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      addresses: user.addresses || [],
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get current user profile
// @route GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      addresses: user.addresses || [],
      googleId: user.googleId,
      hasPassword: Boolean(user.password),
      createdAt: user.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Add delivery address
// @route POST /api/auth/addresses
const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { fullName, phone, line1, line2, city, state, pincode } = req.body;
    
    // Check for exact duplicate
    const existing = user.addresses.find(a => 
      a.line1 === line1 && a.city === city && a.pincode === pincode
    );

    if (!existing) {
      user.addresses.push({ fullName, phone, line1, line2, city, state, pincode });
      await user.save();
    }
    
    res.status(201).json(user.addresses);
  } catch (error) {
    next(error);
  }
};

// @desc  Google Login
// @route POST /api/auth/google
const googleLogin = async (req, res, next) => {
  try {
    const { token, isAccessToken } = req.body;
    if (!token) return res.status(400).json({ message: 'Google token is required' });

    let email, name, googleId;

    if (isAccessToken) {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!data.email) throw new Error('Invalid access token');
      email = data.email;
      name = data.name;
      googleId = data.sub;
    } else {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
      googleId = payload.sub;
    }

    let user = await User.findOne({ email }).select('+password');

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        isVerified: true, // Google login is inherently verified
      });
    }

    const userToken = generateToken(user._id);

    // --- Create Active Session Document ---
    await Session.create({
      userId: user._id,
      token: userToken,
      ip: req.ip || req.headers['x-forwarded-for'] || '',
      device: req.headers['user-agent'] || '',
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      addresses: user.addresses || [],
      googleId: user.googleId,
      hasPassword: Boolean(user.password),
      token: userToken,
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ message: 'Google login failed' });
  }
};

// @desc  Update user profile & set password
// @route PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.body.name) {
      user.name = req.body.name;
    }

    let passwordUpdated = false;
    const newPass = req.body.password || req.body.newPassword;
    if (newPass && newPass.trim().length >= 6) {
      user.password = newPass; // Pre-save hook automatically hashes password
      passwordUpdated = true;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      addresses: updatedUser.addresses,
      googleId: updatedUser.googleId,
      hasPassword: Boolean(updatedUser.password),
      message: passwordUpdated ? 'Password set successfully!' : 'Profile updated successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/auth/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user role (Admin)
// @route   PUT /api/auth/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = req.body.role || user.role;
    await user.save();
    
    res.json({ message: 'User role updated successfully', role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete an admin user' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc  Forgot Password (Generate OTP)
// @route POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }
    
    if (user.googleId && !user.password) {
      return res.status(400).json({ message: 'This account uses Google Login. No password to reset.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    await Otp.deleteMany({ email: user.email, type: 'resetPassword' });
    await Otp.create({
      email: user.email,
      otp: otp,
      type: 'resetPassword',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 mins
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
        <h2 style="color: #2b5a41; text-align: center;">ShopEase Password Reset</h2>
        <p style="color: #4b5563; font-size: 16px;">Hello ${user.name},</p>
        <p style="color: #4b5563; font-size: 16px;">You requested a password reset. Here is your One-Time Password (OTP):</p>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1a3627; border-radius: 8px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #4b5563; font-size: 14px;">This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your Password Reset OTP - ShopEase',
        html,
      });
      res.status(200).json({ message: 'OTP sent to email' });
    } catch (err) {
      console.error('Email error:', err);
      return res.status(500).json({ message: 'Error sending email. Please check your .env configuration.' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc  Verify OTP
// @route POST /api/auth/verify-otp
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const otpRecord = await Otp.findOne({ email, otp, type: 'resetPassword' });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc  Reset Password (Verify OTP and save new password)
// @route POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Please provide email, OTP, and new password' });
    }

    const otpRecord = await Otp.findOne({ email, otp, type: 'resetPassword' });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save(); // Password will be hashed in pre-save hook
    
    await Otp.deleteMany({ email, type: 'resetPassword' });

    res.status(200).json({ message: 'Password reset successful. Please login.' });
  } catch (error) {
    next(error);
  }
};

// @desc  Logout user (deactivate current session)
// @route POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      await Session.updateOne({ token }, { isActive: false });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  logout,
  getMe,
  addAddress,
  googleLogin,
  updateProfile,
  forgotPassword,
  verifyOTP,
  resetPassword,
  getAllUsers,
  updateUserRole,
  deleteUser,
};
