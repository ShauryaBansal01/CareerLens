const User = require('../models/User');
const OTP = require('../models/OTP');
const RefreshToken = require('../models/RefreshToken');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

// Identical response for both branches of an email lookup, so the endpoint
// can't be used to discover which addresses have accounts.
const GENERIC_OTP_RESPONSE = 'If that email can be used, a verification code has been sent.';

/**
 * Logs the real error server-side and returns an opaque message to the client.
 * Never hand `error.message` to callers — it leaks driver and schema details.
 */
function fail(res, context, error, status = 500, message = 'Something went wrong. Please try again.') {
  console.error(`[auth] ${context}:`, error);
  return res.status(status).json({ message });
}

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

/**
 * Rotate a refresh token: revoke the presented one, issue a replacement in the
 * same family.
 *
 * If a token that was *already* revoked is presented, that means someone is
 * replaying a stolen token — the whole family is burned so neither the
 * attacker nor the legitimate holder can continue, forcing a fresh login.
 */
async function rotateRefreshToken(oldToken, oldFamily) {
  const tokenHash = RefreshToken.hashToken(oldToken);

  // Atomically find and revoke to prevent race condition reuse
  const existing = await RefreshToken.findOneAndUpdate(
    { tokenHash, family: oldFamily, revoked: false },
    { revoked: true },
    { new: true }
  );

  if (!existing) {
    // Reuse detection: the token exists but was already spent.
    const replayed = await RefreshToken.findOne({ tokenHash, family: oldFamily });
    if (replayed) {
      console.warn(`[auth] refresh token reuse detected for family ${oldFamily} — revoking family`);
      await RefreshToken.updateMany(
        { family: oldFamily, revoked: false },
        { revoked: true }
      );
    }
    return null;
  }

  if (existing.expiresAt && existing.expiresAt.getTime() < Date.now()) {
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
  });

  // Point the *spent* token at its replacement (audit trail).
  await RefreshToken.updateOne({ _id: existing._id }, { replacedBy: newTokenHash });

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

function otpEmailTemplate({ heading, intro, code, footer }) {
  return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #6366f1; text-align: center;">${heading}</h2>
        <p style="font-size: 16px; color: #333;">Hello,</p>
        <p style="font-size: 16px; color: #333;">${intro}</p>
        <div style="background-color: #f4f4f5; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="margin: 0; letter-spacing: 5px; color: #111; font-family: 'Courier New', monospace;">${code}</h1>
        </div>
        <p style="font-size: 14px; color: #666; text-align: center;">${footer}</p>
      </div>
    `;
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

    const userExists = await User.findOne({ email });

    if (userExists) {
      // Deliberately no OTP is issued — but the response is identical to the
      // success path, so this endpoint reveals nothing about who has an
      // account. The owner of the inbox still gets told what happened.
      await sendEmail({
        email,
        subject: 'CareerLens - Account Already Registered',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #6366f1; text-align: center;">You already have a CareerLens account</h2>
        <p style="font-size: 16px; color: #333;">Someone tried to register using this email address. An account already exists, so no verification code was issued.</p>
        <p style="font-size: 16px; color: #333;">If this was you, please log in instead — or use "Forgot password" if you can't remember your password.</p>
        <p style="font-size: 14px; color: #666; text-align: center;">If this wasn't you, you can safely ignore this email.</p>
      </div>
    `,
      }).catch((err) => console.error('[auth] duplicate-registration notice failed:', err.message));

      return res.status(200).json({ message: GENERIC_OTP_RESPONSE });
    }

    const otp = await OTP.issue(email);

    await sendEmail({
      email,
      subject: 'CareerLens - Email Verification OTP',
      html: otpEmailTemplate({
        heading: 'Welcome to CareerLens!',
        intro: 'Thank you for registering. Please use the following One-Time Password (OTP) to verify your email address. This code is valid for <strong>5 minutes</strong>.',
        code: otp,
        footer: 'If you did not request this, please ignore this email.',
      }),
    });

    res.status(200).json({ message: GENERIC_OTP_RESPONSE });
  } catch (error) {
    return fail(res, 'sendOtp', error, 500, 'Failed to send OTP. Please try again.');
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

    // Verify inbox ownership *before* touching the users collection, so this
    // endpoint can't be used to probe which emails are registered.
    const otpValid = await OTP.verifyAndConsume(email, otp);
    if (!otpValid) {
      return res.status(400).json({ message: 'OTP has expired or is invalid. Please request a new one.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });

    if (!user) {
      return res.status(400).json({ message: 'Invalid user data' });
    }

    const authData = buildAuthResponse(user);
    const { refreshToken, refreshFamily } = await generateRefreshToken(user._id);
    res.status(201).json({ ...authData, refreshToken, refreshFamily });
  } catch (error) {
    return fail(res, 'registerUser', error, 500, 'Registration failed. Please try again.');
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
      return res.json({ ...authData, refreshToken, refreshFamily });
    }

    res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    return fail(res, 'loginUser', error, 500, 'Login failed. Please try again.');
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

    const user = await User.findOne({ email });
    if (!user) {
      // Return generic message to prevent user enumeration
      return res.status(200).json({ message: 'If an account with that email exists, an OTP has been sent.' });
    }

    const otp = await OTP.issue(email);

    await sendEmail({
      email,
      subject: 'CareerLens - Password Reset OTP',
      html: otpEmailTemplate({
        heading: 'Password Reset - CareerLens',
        intro: 'We received a request to reset your CareerLens account password. Use the following One-Time Password (OTP) to proceed. This code is valid for <strong>5 minutes</strong>.',
        code: otp,
        footer: 'If you did not request this, please ignore this email and your password will remain unchanged.',
      }),
    });

    res.status(200).json({ message: 'If an account with that email exists, an OTP has been sent.' });
  } catch (error) {
    return fail(res, 'forgotPassword', error, 500, 'Failed to send OTP. Please try again.');
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

    const otpValid = await OTP.verifyAndConsume(email, otp);
    if (!otpValid) {
      return res.status(400).json({ message: 'OTP has expired or is invalid. Please request a new one.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    user.password = password;
    await user.save();

    // A password reset must end every existing session — otherwise a stolen
    // refresh token survives the very event meant to lock the attacker out.
    await RefreshToken.updateMany(
      { user: user._id, revoked: false },
      { revoked: true }
    );

    res.status(200).json({ message: 'Password reset successfully. You can now log in with your new password.' });
  } catch (error) {
    return fail(res, 'resetPassword', error, 500, 'Failed to reset password. Please try again.');
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
    return fail(res, 'refreshToken', error, 500, 'Could not refresh session. Please log in again.');
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
    return fail(res, 'logout', error, 500, 'Logout failed. Please try again.');
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    return fail(res, 'getMe', error, 500, 'Could not load your profile.');
  }
};
