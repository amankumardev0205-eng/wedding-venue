import User from '../models/User.js';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendEmail } from '../utils/email.js';
import admin from 'firebase-admin';

const generateToken = (user) => {
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
  return token;
};

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, email, password, role } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    user = new User({
      name,
      email,
      passwordHash: password,
      role: role || 'customer',
      favorites: [],
    });

    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
export const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// @route   POST /api/auth/forgot-password
// @desc    Forgot password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists for that email, a password reset link has been sent.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Reset your WedVenue password',
        text: `Reset your password using this link: ${resetUrl}\n\nThis link expires in 1 hour.`,
        html: `<p>Reset your WedVenue password using this link:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour.</p>`,
      });
    } catch (emailError) {
      user.resetToken = null;
      user.resetExpires = null;
      await user.save();
      return res.status(500).json({ success: false, message: 'Unable to send reset email' });
    }

    res.status(200).json({
      success: true,
      message: 'If an account exists for that email, a password reset link has been sent.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password with token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const resetToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ resetToken });

    if (!user || !user.resetExpires || new Date(user.resetExpires) < new Date()) {
      return res.status(400).json({ success: false, message: 'Reset token is invalid or has expired' });
    }

    user.passwordHash = password;
    user.resetToken = null;
    user.resetExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/auth/google
// @desc    Google login and registration via Firebase ID token
// @access  Public
export const googleLogin = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ success: false, message: 'Firebase ID Token is required' });
  }

  try {
    // Verify the Firebase ID Token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture } = decodedToken;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email not provided by Google account' });
    }

    // Check if user exists in the local Firestore DB
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new customer user document if they do not exist
      user = new User({
        name: name || email.split('@')[0],
        email,
        passwordHash: '', // Social logins do not require local passwords
        role: 'customer',
        avatar: picture || '',
        favorites: [],
      });
      await user.save();
    }

    // Generate our backend-signed custom JWT token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
      },
    });
  } catch (error) {
    console.error('Google Auth Error:', error.message);
    res.status(401).json({ success: false, message: 'Invalid or expired Firebase ID token' });
  }
};
