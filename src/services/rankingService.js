const scoringAlgorithm = require('./scoringAlgorithm');
const config = require('../config/config');

class RankingService {
  async rankResumes(parsedResumes, jobDescription, customWeights = null) {
    const weights = customWeights || config.ranking.weights;
    
    // Parse job description
    const jobRequirements = await this.parseJobDescription(jobDescription);
    
    // Score each resume
    const scoredResumes = parsedResumes.map(resume => {
      const scores = scoringAlgorithm.calculateScores(
        resume.parsed,
        jobRequirements
      );
      
      const weightedScore = this.calculateWeightedScore(scores, weights);
      
      return {
        id: resume.id,
        filename: resume.filename,
        score: Math.round(weightedScore),
        breakdown: scores,
        matchedSkills: this.getMatchedSkills(resume.parsed.skills, jobRequirements.skills),
        experienceMatch: this.matchExperience(resume.parsed.experienceYears, jobRequirements.experienceYears),
        educationMatch: this.matchEducation(resume.parsed.education, jobRequirements.education)
      };
    });

    // Sort by score (descending)
    return scoredResumes.sort((a, b) => b.score - a.score);
  }

  async parseJobDescription(jobDescription) {
    const resumeParser = require('./resumeParser');
    const parsed = await resumeParser.parseText(jobDescription);
    
    // Extract experience requirements
    const experienceMatch = jobDescription.match(/(\d+)\+?\s*years?\s*(?:of\s*)?experience/i);
    const experienceYears = experienceMatch ? parseInt(experienceMatch[1]) : 0;

    return {
      ...parsed,
      experienceYears,
      rawText: jobDescription
    };
  }

  calculateWeightedScore(scores, weights) {
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    
    let weightedSum = 0;
    Object.keys(weights).forEach(key => {
      weightedSum += (scores[key] || 0) * weights[key];
    });

    return (weightedSum / totalWeight) * 100;
  }

  getMatchedSkills(resumeSkills, requiredSkills) {
    return resumeSkills.filter(skill => 
      requiredSkills.some(reqSkill => 
        skill.toLowerCase() === reqSkill.toLowerCase()
      )
    );
  }

  matchExperience(resumeYears, requiredYears) {
    if (requiredYears === 0) return 'Not specified';
    if (resumeYears >= requiredYears) return 'Meets requirement';
    if (resumeYears >= requiredYears * 0.8) return 'Close to requirement';
    return 'Below requirement';
  }

  matchEducation(resumeEducation, requiredEducation) {
    if (requiredEducation.length === 0) return 'Not specified';
    
    const educationLevels = {
      'PhD': 4,
      'Masters': 3,
      'Bachelors': 2,
      'Associate': 1
    };

    const resumeLevel = Math.max(...resumeEducation.map(e => educationLevels[e.degree] || 0), 0);
    const requiredLevel = Math.max(...requiredEducation.map(e => educationLevels[e.degree] || 0), 0);

    if (resumeLevel >= requiredLevel) return 'Meets requirement';
    if (resumeLevel === requiredLevel - 1) return 'Close to requirement';
    return 'Below requirement';
  }
}

module.exports = new RankingService();