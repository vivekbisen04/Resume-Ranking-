const natural = require('natural');
const stopword = require('stopword');

class Tokenizer {
  constructor() {
    this.wordTokenizer = new natural.WordTokenizer();
    this.sentenceTokenizer = new natural.SentenceTokenizer('English');
    this.stemmer = natural.PorterStemmer;
    this.nGrams = natural.NGrams;
  }

  /**
   * Tokenize text into words
   * @param {string} text - The text to tokenize
   * @returns {string[]} Array of word tokens
   */
  tokenizeWords(text) {
    if (!text || typeof text !== 'string') {
      return [];
    }
    return this.wordTokenizer.tokenize(text.toLowerCase());
  }

  /**
   * Tokenize text into sentences
   * @param {string} text - The text to tokenize
   * @returns {string[]} Array of sentences
   */
  tokenizeSentences(text) {
    if (!text || typeof text !== 'string') {
      return [];
    }
    return this.sentenceTokenizer.tokenize(text);
  }

  /**
   * Remove stop words from token array
   * @param {string[]} tokens - Array of tokens
   * @param {string} language - Language for stop words (default: 'en')
   * @returns {string[]} Filtered tokens
   */
  removeStopWords(tokens, language = 'en') {
    return stopword.removeStopwords(tokens, stopword[language]);
  }

  /**
   * Stem tokens using Porter Stemmer
   * @param {string[]} tokens - Array of tokens
   * @returns {string[]} Stemmed tokens
   */
  stemTokens(tokens) {
    return tokens.map(token => this.stemmer.stem(token));
  }

  /**
   * Generate n-grams from tokens
   * @param {string[]} tokens - Array of tokens
   * @param {number} n - Size of n-grams
   * @returns {string[][]} Array of n-grams
   */
  generateNGrams(tokens, n = 2) {
    return this.nGrams.ngrams(tokens, n);
  }

  /**
   * Extract meaningful phrases from text
   * @param {string} text - The text to process
   * @returns {string[]} Array of phrases
   */
  extractPhrases(text) {
    const sentences = this.tokenizeSentences(text);
    const phrases = [];

    sentences.forEach(sentence => {
      // Extract phrases between common delimiters
      const phrasePatterns = [
        /(?:with|in|at|on|for|of|and|or)\s+([^,.;]+)/gi,
        /([^,.;]+)(?:\s+experience|\s+skills|\s+knowledge)/gi,
        /(?:proficient|expert|skilled)\s+(?:in|at|with)\s+([^,.;]+)/gi
      ];

      phrasePatterns.forEach(pattern => {
        const matches = sentence.matchAll(pattern);
        for (const match of matches) {
          if (match[1]) {
            phrases.push(match[1].trim().toLowerCase());
          }
        }
      });
    });

    return [...new Set(phrases)];
  }

  /**
   * Calculate word frequency
   * @param {string[]} tokens - Array of tokens
   * @returns {Object} Word frequency map
   */
  calculateWordFrequency(tokens) {
    const frequency = {};
    
    tokens.forEach(token => {
      frequency[token] = (frequency[token] || 0) + 1;
    });

    return frequency;
  }

  /**
   * Extract key terms from text using TF-IDF-like scoring
   * @param {string} text - The text to process
   * @param {number} topN - Number of top terms to return
   * @returns {string[]} Array of key terms
   */
  extractKeyTerms(text, topN = 10) {
    // Tokenize and clean
    let tokens = this.tokenizeWords(text);
    tokens = this.removeStopWords(tokens);
    
    // Filter out short tokens and numbers
    tokens = tokens.filter(token => 
      token.length > 2 && 
      !/^\d+$/.test(token)
    );

    // Calculate frequency
    const frequency = this.calculateWordFrequency(tokens);
    
    // Sort by frequency and get top N
    const sortedTerms = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([term]) => term);

    return sortedTerms;
  }

  /**
   * Normalize text for comparison
   * @param {string} text - The text to normalize
   * @returns {string} Normalized text
   */
  normalizeText(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Calculate text similarity using Jaccard similarity
   * @param {string} text1 - First text
   * @param {string} text2 - Second text
   * @returns {number} Similarity score (0-1)
   */
  calculateSimilarity(text1, text2) {
    const tokens1 = new Set(this.tokenizeWords(this.normalizeText(text1)));
    const tokens2 = new Set(this.tokenizeWords(this.normalizeText(text2)));

    if (tokens1.size === 0 && tokens2.size === 0) {
      return 1;
    }

    const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);

    return intersection.size / union.size;
  }

  /**
   * Extract entities (like years, percentages, etc.)
   * @param {string} text - The text to process
   * @returns {Object} Extracted entities
   */
  extractEntities(text) {
    const entities = {
      years: [],
      percentages: [],
      numbers: [],
      emails: [],
      urls: [],
      phoneNumbers: []
    };

    // Extract years
    const yearMatches = text.match(/\b(19|20)\d{2}\b/g);
    if (yearMatches) {
      entities.years = [...new Set(yearMatches)];
    }

    // Extract percentages
    const percentMatches = text.match(/\d+(\.\d+)?%/g);
    if (percentMatches) {
      entities.percentages = percentMatches;
    }

    // Extract numbers
    const numberMatches = text.match(/\b\d+(\.\d+)?\b/g);
    if (numberMatches) {
      entities.numbers = numberMatches;
    }

    // Extract emails
    const emailMatches = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g);
    if (emailMatches) {
      entities.emails = emailMatches;
    }

    // Extract URLs
    const urlMatches = text.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g);
    if (urlMatches) {
      entities.urls = urlMatches;
    }

    // Extract phone numbers
    const phoneMatches = text.match(/(\+\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g);
    if (phoneMatches) {
      entities.phoneNumbers = phoneMatches;
    }

    return entities;
  }

  /**
   * Clean and prepare text for NLP processing
   * @param {string} text - The text to clean
   * @returns {string} Cleaned text
   */
  cleanText(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }

    return text
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove non-ASCII characters but keep common accented letters
      .replace(/[^\x00-\x7F\u00C0-\u024F\u1E00-\u1EFF]/g, '')
      // Remove multiple punctuation
      .replace(/([.!?])\1+/g, '$1')
      // Add space after punctuation if missing
      .replace(/([.!?,;:])([A-Za-z])/g, '$1 $2')
      // Remove leading/trailing whitespace
      .trim();
  }

  /**
   * Extract skill-like patterns from text
   * @param {string} text - The text to process
   * @returns {string[]} Array of potential skills
   */
  extractSkillPatterns(text) {
    const patterns = [
      // Technology + version (e.g., "Python 3.9", "Java 8")
      /\b([A-Za-z]+(?:\s+[A-Za-z]+)*)\s+\d+(?:\.\d+)*\b/gi,
      // Acronyms (e.g., "API", "REST", "SQL")
      /\b[A-Z]{2,}(?:\s+[A-Z]{2,})*\b/g,
      // CamelCase or PascalCase (e.g., "JavaScript", "PostgreSQL")
      /\b[A-Z][a-z]+(?:[A-Z][a-z]+)+\b/g,
      // Hyphenated terms (e.g., "full-stack", "front-end")
      /\b[a-z]+(?:-[a-z]+)+\b/gi,
      // Dot notation (e.g., "Node.js", "Vue.js")
      /\b[A-Za-z]+\.[a-z]{2,}\b/g
    ];

    const skills = new Set();

    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleaned = match.trim();
          if (cleaned.length > 1 && cleaned.length < 30) {
            skills.add(cleaned);
          }
        });
      }
    });

    return Array.from(skills);
  }
}

module.exports = new Tokenizer();