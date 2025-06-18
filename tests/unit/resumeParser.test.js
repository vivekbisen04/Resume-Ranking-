const resumeParser = require('../../src/services/resumeParser');

describe('ResumeParser', () => {
  describe('extractSkills', () => {
    it('should extract technical skills from text', () => {
      const text = 'Experienced in JavaScript, React, and Node.js development';
      const skills = resumeParser.extractSkills(text.toLowerCase());
      
      expect(skills).toContain('javascript');
      expect(skills).toContain('react');
      expect(skills).toContain('node.js');
    });

    it('should not extract duplicate skills', () => {
      const text = 'JavaScript developer with JavaScript experience';
      const skills = resumeParser.extractSkills(text.toLowerCase());
      
      expect(skills.filter(s => s === 'javascript').length).toBe(1);
    });
  });

  describe('calculateExperienceYears', () => {
    it('should calculate years of experience correctly', () => {
      const currentYear = new Date().getFullYear();
      const text = `Working since 2015 to ${currentYear}`;
      const years = resumeParser.calculateExperienceYears(text);
      
      expect(years).toBe(currentYear - 2015);
    });

    it('should return 0 for no year matches', () => {
      const text = 'No years mentioned in this text';
      const years = resumeParser.calculateExperienceYears(text);
      
      expect(years).toBe(0);
    });
  });

  describe('extractEducation', () => {
    it('should extract degree information', () => {
      const text = 'Bachelor of Science in Computer Science from MIT';
      const education = resumeParser.extractEducation(text);
      
      expect(education.length).toBeGreaterThan(0);
      expect(education[0].degree).toBe('Bachelors');
    });
  });

  describe('extractContact', () => {
    it('should extract email and phone', () => {
      const text = 'Contact: john.doe@example.com, 555-123-4567';
      const contact = resumeParser.extractContact(text);
      
      expect(contact.email).toBe('john.doe@example.com');
      expect(contact.phone).toBe('555-123-4567');
    });
  });
});