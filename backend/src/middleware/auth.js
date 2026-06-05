const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      console.log('[AUTH MW] No token provided for', req.method, req.originalUrl);
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      console.log('[AUTH MW] Token valid but user not found, id:', decoded.id);
      return res.status(401).json({ success: false, message: 'Token is valid but user not found.' });
    }
    console.log('[AUTH MW] Authenticated:', req.user.email, '→', req.method, req.originalUrl);
    next();
  } catch (error) {
    console.log('[AUTH MW] Token error:', error.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
  }
  next();
};

module.exports = { protect, adminOnly };
