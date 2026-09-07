const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes: verifies Bearer token in Authorization header
 */
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route (Missing token)',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'super_secret_catalogue_jwt_key_2026';
    const decoded = jwt.verify(token, secret);

    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not found with provided token',
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route (Invalid token)',
    });
  }
};

/**
 * Role-based authorization check
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role '${req.user ? req.user.role : 'none'}' is not authorized to perform this action`,
      });
    }
    next();
  };
};
