const express = require("express");
const router = express.Router();
const resumeController = require("../controllers/resumeController");
const { authenticateJWT, authenticateAPIKey } = require("../middleware/auth");
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
 *                 description: Job description text
 *               resumes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               weights:
 *                 type: object
 *                 properties:
 *                   skills:
 *                     type: number
 *                   experience:
 *                     type: number
 *                   education:
 *                     type: number
 *                   keywords:
 *                     type: number
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jobDescription:
 *                 type: string
 *               resumes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     content:
 *                       type: string
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
 */
router.post(
  "/rank",
  authenticateAPIKey,
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
 */
router.post(
  "/analyze",
  authenticateAPIKey,
  upload.single("resume"),
  resumeController.analyzeResume
);

module.exports = router;
