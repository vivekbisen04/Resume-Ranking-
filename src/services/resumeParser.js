const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const natural = require('natural');
const stopword = require('stopword');

class ResumeParser {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
  }

  async parseFile(file) {
    const fileType = file.mimetype;
    
    if (fileType === 'application/pdf') {
      const data = await pdfParse(file.buffer);
      return data.text;
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return result.value;
    } else if (fileType === 'text/plain') {
      return file.buffer.toString('utf-8');
    } else {
      throw new Error('Unsupported file format');
    }
  }

  async parseText(text) {
    const normalizedText = text.toLowerCase();
    
    return {
      skills: this.extractSkills(normalizedText),
      experience: this.extractExperience(normalizedText),
      experienceYears: this.calculateExperienceYears(normalizedText),
      education: this.extractEducation(normalizedText),
      keywords: this.extractKeywords(text),
      contact: this.extractContact(text)
    };
  }

  extractSkills(text) {
    const skillPatterns = [
      'javascript', 'python', 'java', 'c\\+\\+', 'c#', 'ruby', 'php', 'swift',
      'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask',
      'spring', 'mongodb', 'mysql', 'postgresql', 'redis', 'elasticsearch',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'git', 'jenkins',
      'machine learning', 'deep learning', 'nlp', 'tensorflow', 'pytorch',
      'html', 'css', 'sass', 'typescript', 'graphql', 'rest api'
    ];

    const foundSkills = [];
    skillPatterns.forEach(skill => {
      // Create regex pattern, but don't escape dots for display
      const regexPattern = skill.replace(/\./g, '\\.').replace(/\+/g, '\\+');
      const regex = new RegExp(`\\b${regexPattern}\\b`, 'i');
      if (regex.test(text)) {
        // Add the skill without regex escaping
        foundSkills.push(skill);
      }
    });

    return [...new Set(foundSkills)];
  }

  extractExperience(text) {
    const experienceKeywords = ['experience', 'work history', 'employment', 'professional experience'];
    const experiences = [];
    
    const lines = text.split('\n');
    let inExperienceSection = false;
    
    lines.forEach(line => {
      if (experienceKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
        inExperienceSection = true;
      }
      
      if (inExperienceSection && line.trim().length > 0) {
        const yearMatch = line.match(/\b(19|20)\d{2}\b/g);
        if (yearMatch) {
          experiences.push({
            text: line.trim(),
            years: yearMatch
          });
        }
      }
    });

    return experiences;
  }

  calculateExperienceYears(text) {
    const currentYear = new Date().getFullYear();
    const yearMatches = text.match(/\b(19|20)\d{2}\b/g);
    
    if (!yearMatches || yearMatches.length < 2) {
      return 0;
    }

    const years = yearMatches.map(y => parseInt(y)).sort();
    const oldestYear = years[0];
    
    return Math.min(currentYear - oldestYear, 30); // Cap at 30 years
  }

  extractEducation(text) {
    const degreePatterns = [
      { pattern: /\b(ph\.?d|doctorate)\b/i, degree: 'PhD' },
      { pattern: /\b(master|m\.?s\.?|m\.?a\.?|mba)\b/i, degree: 'Masters' },
      { pattern: /\b(bachelor|b\.?s\.?|b\.?a\.?|b\.?tech|b\.?e\.?)\b/i, degree: 'Bachelors' },
      { pattern: /\b(associate|a\.?s\.?|a\.?a\.?)\b/i, degree: 'Associate' }
    ];

    const education = [];
    const lines = text.split('\n');

    lines.forEach(line => {
      degreePatterns.forEach(({ pattern, degree }) => {
        if (pattern.test(line)) {
          education.push({
            degree,
            text: line.trim()
          });
        }
      });
    });

    return education;
  }

  extractKeywords(text) {
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    const filtered = stopword.removeStopwords(tokens);
    
    // Calculate word frequency
    const frequency = {};
    filtered.forEach(word => {
      if (word.length > 2) {
        frequency[word] = (frequency[word] || 0) + 1;
      }
    });

    // Sort by frequency and return top keywords
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);
  }

  extractContact(text) {
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    const phoneMatch = text.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/);
    
    return {
      email: emailMatch ? emailMatch[0] : null,
      phone: phoneMatch ? phoneMatch[0] : null
    };
  }
}

module.exports = new ResumeParser();