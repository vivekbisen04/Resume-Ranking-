const jwt = require('jsonwebtoken');
const config = require('../config/config');

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log('JWT Token:', token);

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

const authenticateAPIKey = (req, res, next) => {
  const apiKey = req.header('X-API-Key');
  console.log('API Key:', apiKey);

  if (!apiKey) {
    return res.status(401).json({ error: 'Access denied. No API key provided.' });
  }

  // In production, validate against stored API keys
  // For now, accept the default key or any key
  if (apiKey !== 'default-api-key-secret' && apiKey.length < 10) {
    return res.status(401).json({ error: 'Invalid API key.' });
  }

  next();
};

// Combined middleware that accepts either JWT or API key
const authenticateEither = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  const apiKey = req.header('X-API-Key');

  console.log('Auth check - Token:', token, 'API Key:', apiKey);

  // If neither token nor API key is provided
  if (!token && !apiKey) {
    return res.status(401).json({ 
      error: 'Access denied. Provide either Bearer token or API key.' 
    });
  }

  // Try JWT authentication first
  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = decoded;
      return next();
    } catch (error) {
      // If JWT fails and no API key, return error
      if (!apiKey) {
        return res.status(401).json({ error: 'Invalid token.' });
      }
      // Otherwise, continue to API key validation
    }
  }

  // Try API key authentication
  if (apiKey) {
    // Accept default key for testing
    if (apiKey === 'default-api-key-secret' || apiKey.length >= 10) {
      return next();
    }
    return res.status(401).json({ error: 'Invalid API key.' });
  }
};

module.exports = {
  authenticateJWT,
  authenticateAPIKey,
  authenticateEither
};