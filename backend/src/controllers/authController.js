const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  console.log('[AUTH] POST /register — body:', { name: req.body.name, email: req.body.email, role: req.body.role });
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { name, email, password, role } = req.body;
  if (await User.findOne({ email }))
    return res.status(400).json({ success: false, message: 'Email already registered' });

  const user = await User.create({ name, email, password, role: role || 'member' });
  const token = generateToken(user._id);
  res.status(201).json({ success: true, token, user });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  console.log('[AUTH] POST /login — email:', req.body.email);
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ success: false, message: 'Invalid email or password' });

  const token = generateToken(user._id);
  res.json({ success: true, token, user });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  console.log('[AUTH] GET /me — userId:', req.user?._id);
  res.json({ success: true, user: req.user });
});

module.exports = { register, login, getMe };
