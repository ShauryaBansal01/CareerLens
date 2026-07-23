const crypto = require('crypto');
const User = require('../models/User');
const OTP = require('../models/OTP');
const RefreshToken = require('../models/RefreshToken');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

// Generate short-lived access token
const generateAccessToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

// Generate refresh token pair (token + family)
async function generateRefreshToken(userId) {
  const family = RefreshToken.generateFamily();
  const token = RefreshToken.generateToken();
  const tokenHash = RefreshToken.hashToken(token);

  await RefreshToken.create({
    user: userId,
    tokenHash,
    family,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
  });

  return { refreshToken: token, refreshFamily: family };
}

// Rotate refresh token (invalidate old, issue new in same family)
async function rotateRefreshToken(oldToken, oldFamily) {
  const tokenHash = RefreshToken.hashToken(oldToken);

  // Atomically find and revoke to prevent race condition reuse
  const existing = await RefreshToken.findOneAndUpdate(
    { tokenHash, family: oldFamily, revoked: false },
    { revoked: true },
    { new: true }
  );

  if (!existing) {
    return null;
  }

  // Issue new one in same family
  const newToken = RefreshToken.generateToken();
  const newTokenHash = RefreshToken.hashToken(newToken);

  await RefreshToken.create({
    user: existing.user,
    tokenHash: newTokenHash,
    family: oldFamily,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    replacedBy: newTokenHash,
  });

  return { refreshToken: newToken, refreshFamily: oldFamily, userId: existing.user };
}

// Build auth response with access + refresh tokens
function buildAuthResponse(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateAccessToken(user._id),
  };
}

// @desc    Send OTP to email for verification
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide an email address' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate a 10-character alphanumeric OTP (crypto-random, more entropy than 6-digit numeric)
    const otp = crypto.randomBytes(5).toString('hex').toUpperCase();

    // Store OTP in database (will automatically expire in 5 mins due to TTL index)
    await OTP.create({ email, otp });

    // Send the email
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #6366f1; text-align: center;">Welcome to CareerLens!</h2>
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333;">Thank you for registering. Please use the following One-Time Password (OTP) to verify your email address. This code is valid for <strong>5 minutes</strong>.</p>
        <div style="background-color: #f4f4f5; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="margin: 0; letter-spacing: 5px; color: #111; font-family: 'Courier New', monospace;">${otp}</h1>
        </div>
        <p style="font-size: 14px; color: #666; text-align: center;">If you did not request this, please ignore this email.</p>
      </div>
    `;

    await sendEmail({
      email: email,
      subject: 'CareerLens - Email Verification OTP',
      html: message,
    });

    res.status(200).json({ message: 'OTP sent to email successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }

    // Atomically find and delete OTP to prevent race condition reuse
    const otpRecord = await OTP.findOneAndDelete({ email, otp }, { sort: { createdAt: -1 } });

    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP has expired or is invalid. Please request a new one.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      const authData = buildAuthResponse(user);
      const { refreshToken, refreshFamily } = await generateRefreshToken(user._id);
      res.status(201).json({ ...authData, refreshToken, refreshFamily });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (user && (await user.matchPassword(password))) {
      const authData = buildAuthResponse(user);
      const { refreshToken, refreshFamily } = await generateRefreshToken(user._id);
      res.json({ ...authData, refreshToken, refreshFamily });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send OTP for password reset
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide an email address' });
    }

    // Check if user exists (unlike sendOtp, we want user to exist)
    const user = await User.findOne({ email });
    if (!user) {
      // Return generic message to prevent user enumeration
      return res.status(200).json({ message: 'If an account with that email exists, an OTP has been sent.' });
    }

    // Generate a 10-character alphanumeric OTP
    const otp = crypto.randomBytes(5).toString('hex').toUpperCase();

    // Store OTP in database (will automatically expire in 5 mins due to TTL index)
    await OTP.create({ email, otp });

    // Send the email
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #6366f1; text-align: center;">Password Reset - CareerLens</h2>
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333;">We received a request to reset your CareerLens account password. Use the following One-Time Password (OTP) to proceed. This code is valid for <strong>5 minutes</strong>.</p>
        <div style="background-color: #f4f4f5; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="margin: 0; letter-spacing: 5px; color: #111; font-family: 'Courier New', monospace;">${otp}</h1>
        </div>
        <p style="font-size: 14px; color: #666; text-align: center;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
      </div>
    `;

    await sendEmail({
      email: email,
      subject: 'CareerLens - Password Reset OTP',
      html: message,
    });

    res.status(200).json({ message: 'If an account with that email exists, an OTP has been sent.' });
  } catch (error) {
    console.error('Error sending password reset OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
};

// @desc    Reset password using OTP
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ message: 'Please provide email, OTP, and new password' });
    }

    // Atomically find and delete OTP to prevent race condition reuse
    const otpRecord = await OTP.findOneAndDelete({ email, otp }, { sort: { createdAt: -1 } });

    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP has expired or is invalid. Please request a new one.' });
    }

    // Find user and update password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    user.password = password;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully. You can now log in with your new password.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Refresh access token using refresh token
// @route   POST /api/auth/refresh-token
// @access  Public (with valid refresh token)
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken, refreshFamily } = req.body;

    if (!refreshToken || !refreshFamily) {
      return res.status(400).json({ message: 'Refresh token and family are required' });
    }

    const result = await rotateRefreshToken(refreshToken, refreshFamily);

    if (!result) {
      return res.status(401).json({ message: 'Invalid or revoked refresh token' });
    }

    const user = await User.findById(result.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const authData = buildAuthResponse(user);
    res.json({ ...authData, refreshToken: result.refreshToken, refreshFamily: result.refreshFamily });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout — revoke all refresh tokens for user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    await RefreshToken.updateMany(
      { user: req.user.id, revoked: false },
      { revoked: true }
    );
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
