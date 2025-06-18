const natural = require('natural');

class ScoringAlgorithm {
  constructor() {
    this.tfidf = new natural.TfIdf();
  }

  calculateScores(resume, jobRequirements) {
    return {
      skills: this.scoreSkills(resume.skills, jobRequirements.skills),
      experience: this.scoreExperience(resume.experienceYears, jobRequirements.experienceYears),
      education: this.scoreEducation(resume.education, jobRequirements.education),
      keywords: this.scoreKeywords(resume.keywords, jobRequirements.keywords)
    };
  }

  scoreSkills(resumeSkills, requiredSkills) {
    if (requiredSkills.length === 0) return 0.5;
    
    const matchedSkills = resumeSkills.filter(skill =>
      requiredSkills.some(reqSkill =>
        skill.toLowerCase() === reqSkill.toLowerCase()
      )
    );

    return matchedSkills.length / requiredSkills.length;
  }

  scoreExperience(resumeYears, requiredYears) {
    if (requiredYears === 0) return 0.5;
    
    if (resumeYears >= requiredYears) {
      return 1.0;
    } else if (resumeYears >= requiredYears * 0.8) {
      return 0.8;
    } else if (resumeYears >= requiredYears * 0.6) {
      return 0.6;
    } else {
      return Math.max(0.2, resumeYears / requiredYears);
    }
  }

  scoreEducation(resumeEducation, requiredEducation) {
    if (requiredEducation.length === 0) return 0.5;
    
    const educationLevels = {
      'PhD': 4,
      'Masters': 3,
      'Bachelors': 2,
      'Associate': 1
    };

    const resumeLevel = Math.max(...resumeEducation.map(e => educationLevels[e.degree] || 0), 0);
    const requiredLevel = Math.max(...requiredEducation.map(e => educationLevels[e.degree] || 0), 0);

    if (resumeLevel >= requiredLevel) {
      return 1.0;
    } else if (resumeLevel === requiredLevel - 1) {
      return 0.7;
    } else {
      return Math.max(0.3, resumeLevel / requiredLevel);
    }
  }

  scoreKeywords(resumeKeywords, jobKeywords) {
    if (jobKeywords.length === 0) return 0.5;
    
    const matchedKeywords = resumeKeywords.filter(keyword =>
      jobKeywords.includes(keyword.toLowerCase())
    );

    return Math.min(1.0, matchedKeywords.length / (jobKeywords.length * 0.3));
  }
}

module.exports = new ScoringAlgorithm();