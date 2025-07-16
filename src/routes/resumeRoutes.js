const express = require("express");
const router = express.Router();
const resumeController = require("../controllers/resumeController");
const { authenticateJWT, authenticateAPIKey, authenticateEither } = require("../middleware/auth");
const { validateRankingRequest } = require("../middleware/validation");
const { upload } = require("../utils/fileHandler");

/**
 * @swagger
 * /resumes/rank:
 *   post:
 *     summary: Rank resumes based on job description
 *     tags: [Resume Ranking]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:      
 *               jobDescription:
 *                 type: string
 *                 description: Job description text (minimum 50 characters)
 *               resumes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               weights:
 *                 type: string
 *                 description: JSON string of weights object
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jobDescription:
 *                 type: string
 *                 minLength: 50
 *               resumes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     content:
 *                       type: string
 *               weights:
 *                 type: object
 *                 properties:
 *                   skills:
 *                     type: number
 *                     default: 0.35
 *                   experience:
 *                     type: number
 *                     default: 0.25
 *                   education:
 *                     type: number
 *                     default: 0.20
 *                   keywords:
 *                     type: number
 *                     default: 0.20
 *     responses:
 *       200:
 *         description: Ranked resumes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jobDescription:
 *                   type: string
 *                 totalResumes:
 *                   type: number
 *                 rankedResumes:
 *                   type: array
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/rank",
  authenticateEither,  // Changed from authenticateAPIKey to authenticateEither
  upload.array("resumes", 50),
  validateRankingRequest,
  resumeController.rankResumes
);

/**
 * @swagger
 * /resumes/analyze:
 *   post:
 *     summary: Analyze a single resume
 *     tags: [Resume Analysis]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resume analysis
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/analyze",
  authenticateEither,  // Changed from authenticateAPIKey to authenticateEither
  upload.single("resume"),
  resumeController.analyzeResume
);

module.exports = router;