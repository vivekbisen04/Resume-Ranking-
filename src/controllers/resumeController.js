const resumeParser = require('../services/resumeParser');
const rankingService = require('../services/rankingService');
const { logger } = require('../middleware/logger');
const { log } = require('winston');

const rankResumes = async (req, res, next) => {
  try {
    const { jobDescription, weights } = req.body;
    let resumes = [];
    console.log(jobDescription, weights);
    

    // Handle both text input and file uploads
    if (req.files && req.files.length > 0) {
      // Parse uploaded files
      const parsePromises = req.files.map(async (file, index) => {
        const parsedContent = await resumeParser.parseFile(file);
        return {
          id: file.originalname || `resume-${index + 1}`,
          content: parsedContent,
          filename: file.originalname
        };
      });
      resumes = await Promise.all(parsePromises);
    } else if (req.body.resumes) {
      // Use provided text resumes
      resumes = req.body.resumes;
    } else {
      return res.status(400).json({ error: 'No resumes provided' });
    }

    // Parse and rank resumes
    const parsedResumes = await Promise.all(
      resumes.map(async (resume) => {
        const parsed = await resumeParser.parseText(resume.content);
        return {
          id: resume.id,
          filename: resume.filename,
          parsed
        };
      })
    );

    const rankedResumes = await rankingService.rankResumes(
      parsedResumes,
      jobDescription,
      weights
    );

    logger.info(`Successfully ranked ${rankedResumes.length} resumes`);

    res.json({
      jobDescription: jobDescription.substring(0, 100) + '...',
      totalResumes: rankedResumes.length,
      rankedResumes
    });
  } catch (error) {
    next(error);
  }
};

const analyzeResume = async (req, res, next) => {
  try {
    let content;
    
    if (req.file) {
      content = await resumeParser.parseFile(req.file);
    } else if (req.body.content) {
      content = req.body.content;
    } else {
      return res.status(400).json({ error: 'No resume content provided' });
    }

    const analysis = await resumeParser.parseText(content);
    
    res.json({
      analysis,
      summary: {
        skillsCount: analysis.skills.length,
        experienceYears: analysis.experienceYears,
        educationLevel: analysis.education.length > 0 ? analysis.education[0].degree : 'Not specified'
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  rankResumes,
  analyzeResume
};