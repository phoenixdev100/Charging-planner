// backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user ID to request
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid authentication token' });
  }
};

module.exports = authMiddleware;