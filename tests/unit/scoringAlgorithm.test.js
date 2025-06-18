const scoringAlgorithm = require('../../src/services/scoringAlgorithm');

describe('ScoringAlgorithm', () => {
  describe('scoreSkills', () => {
    it('should return 1.0 for perfect skill match', () => {
      const resumeSkills = ['javascript', 'react', 'node.js'];
      const requiredSkills = ['javascript', 'react', 'node.js'];
      
      const score = scoringAlgorithm.scoreSkills(resumeSkills, requiredSkills);
      expect(score).toBe(1.0);
    });

    it('should return 0.5 for half skill match', () => {
      const resumeSkills = ['javascript', 'react'];
      const requiredSkills = ['javascript', 'react', 'node.js', 'python'];
      
      const score = scoringAlgorithm.scoreSkills(resumeSkills, requiredSkills);
      expect(score).toBe(0.5);
    });

    it('should return 0.5 when no required skills', () => {
      const resumeSkills = ['javascript', 'react'];
      const requiredSkills = [];
      
      const score = scoringAlgorithm.scoreSkills(resumeSkills, requiredSkills);
      expect(score).toBe(0.5);
    });
  });

  describe('scoreExperience', () => {
    it('should return 1.0 for meeting experience requirement', () => {
      const score = scoringAlgorithm.scoreExperience(5, 5);
      expect(score).toBe(1.0);
    });

    it('should return 1.0 for exceeding experience requirement', () => {
      const score = scoringAlgorithm.scoreExperience(7, 5);
      expect(score).toBe(1.0);
    });

    it('should return 0.8 for 80% of required experience', () => {
      const score = scoringAlgorithm.scoreExperience(4, 5);
      expect(score).toBe(0.8);
    });
  });

  describe('scoreEducation', () => {
    it('should return 1.0 for matching education level', () => {
      const resumeEducation = [{ degree: 'Masters' }];
      const requiredEducation = [{ degree: 'Masters' }];
      
      const score = scoringAlgorithm.scoreEducation(resumeEducation, requiredEducation);
      expect(score).toBe(1.0);
    });

    it('should return 1.0 for exceeding education level', () => {
      const resumeEducation = [{ degree: 'PhD' }];
      const requiredEducation = [{ degree: 'Masters' }];
      
      const score = scoringAlgorithm.scoreEducation(resumeEducation, requiredEducation);
      expect(score).toBe(1.0);
    });
  });
});