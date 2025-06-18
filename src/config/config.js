module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-this',
    expiresIn: '24h'
  },
  apiKey: {
    secret: process.env.API_KEY_SECRET || 'default-api-key-secret'
  },
  ranking: {
    weights: {
      skills: 0.35,
      experience: 0.25,
      education: 0.20,
      keywords: 0.20
    },
    thresholds: {
      minScore: 0,
      maxScore: 100
    }
  },
  fileUpload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedFormats: ['pdf', 'docx', 'txt']
  }
};