const jwt = require('jsonwebtoken');
const config = require('../config/config');

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

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

  if (!apiKey) {
    return res.status(401).json({ error: 'Access denied. No API key provided.' });
  }

  // In production, you would validate against stored API keys
  if (apiKey !== config.apiKey.secret) {
    return res.status(401).json({ error: 'Invalid API key.' });
  }

  next();
};

module.exports = {
  authenticateJWT,
  authenticateAPIKey
};