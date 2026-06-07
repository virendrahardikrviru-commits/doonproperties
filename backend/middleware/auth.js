import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Generate JWT token
export const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      google_id: user.google_id 
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Verify JWT token middleware
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if user still exists in database
    const result = await query('SELECT id, email, name, google_id FROM users WHERE id = $1', [decoded.id]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User not found.' 
      });
    }

    // Attach user to request
    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired. Please login again.' 
      });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Authentication error.' 
    });
  }
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      
      const result = await query('SELECT id, email, name, google_id FROM users WHERE id = $1', [decoded.id]);
      
      if (result.rows.length > 0) {
        req.user = result.rows[0];
      }
    }
    
    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};

// Check if user owns a resource (listing, chat, etc.)
export const checkOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tableName = req.params.table || 'listings';
    
    const result = await query(
      `SELECT user_id FROM ${tableName} WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found.'
      });
    }
    
    if (result.rows[0].user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this resource.'
      });
    }
    
    next();
  } catch (error) {
    console.error('Ownership check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking ownership.'
    });
  }
};

export default { generateToken, authenticate, optionalAuth, checkOwnership };