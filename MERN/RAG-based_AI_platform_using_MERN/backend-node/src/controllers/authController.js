const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshExpiry,
} = require('../utils/jwt');

// POST /api/auth/register
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ success: false, message: 'Email already registered.' });
  }

  const user = await User.create({ name, email, password });

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshTokens.push({ token: refreshToken, expiresAt: getRefreshExpiry() });
  await user.save();

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    data: { user, accessToken, refreshToken },
  });
};

// POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !user.isActive) {
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.cleanRefreshTokens();
  user.refreshTokens.push({ token: refreshToken, expiresAt: getRefreshExpiry() });
  user.lastLogin = new Date();
  await user.save();

  res.json({
    success: true,
    message: 'Logged in successfully.',
    data: { user, accessToken, refreshToken },
  });
};

// POST /api/auth/refresh
exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'Refresh token required.' });
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }

  const user = await User.findById(decoded.id).select('+refreshTokens');
  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found.' });
  }

  const tokenDoc = user.refreshTokens.find((t) => t.token === refreshToken);
  if (!tokenDoc || new Date(tokenDoc.expiresAt) < new Date()) {
    return res.status(401).json({ success: false, message: 'Refresh token expired or revoked.' });
  }

  // Rotate: remove old, issue new
  user.refreshTokens = user.refreshTokens.filter((t) => t.token !== refreshToken);
  const newRefreshToken = generateRefreshToken(user._id);
  user.refreshTokens.push({ token: newRefreshToken, expiresAt: getRefreshExpiry() });
  await user.save();

  const accessToken = generateAccessToken(user._id, user.role);

  res.json({
    success: true,
    data: { accessToken, refreshToken: newRefreshToken },
  });
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    const user = await User.findById(req.user._id).select('+refreshTokens');
    if (user) {
      user.refreshTokens = user.refreshTokens.filter((t) => t.token !== refreshToken);
      await user.save();
    }
  }

  res.json({ success: true, message: 'Logged out successfully.' });
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('documentCount');
  res.json({ success: true, data: { user } });
};
