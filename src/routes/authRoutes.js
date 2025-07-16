const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: 'Format: Bearer {token}'
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: User already exists
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token - Use this in Authorization header as "Bearer {token}"
 *                 expiresIn:
 *                   type: string
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/api-key:
 *   post:
 *     summary: Generate API key for service-to-service authentication
 *     description: |
 *       Generates a permanent API key that can be used instead of JWT tokens.
 *       
 *       **Why use API keys?**
 *       - JWT tokens expire after 24 hours
 *       - API keys are permanent (don't expire)
 *       - Better for automated scripts and service integrations
 *       - Use in X-API-Key header for resume ranking endpoints
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: API key generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 apiKey:
 *                   type: string
 *                   description: Use this in X-API-Key header for API requests
 *       401:
 *         description: Missing or invalid bearer token
 */
router.post('/api-key', authenticateJWT, authController.generateApiKey);

module.exports = router;