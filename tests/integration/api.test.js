const request = require('supertest');
const app = require('../../src/app');

describe('API Integration Tests', () => {
  let authToken;
  let apiKey;

  beforeAll(async () => {
    // Register and login to get auth token
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', password: 'testpass123' });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'testpass123' });

    authToken = loginResponse.body.token;

    // Generate API key
    const apiKeyResponse = await request(app)
      .post('/api/auth/api-key')
      .set('Authorization', `Bearer ${authToken}`);

    apiKey = apiKeyResponse.body.apiKey;
  });

  describe('POST /api/resumes/rank', () => {
    it('should rank resumes with text input', async () => {
      const requestBody = {
        jobDescription: 'We are looking for a Senior JavaScript Developer with 5+ years of experience in React and Node.js. Must have strong problem-solving skills and experience with cloud platforms.',
        resumes: [
          {
            id: 'resume1',
            content: 'John Doe - Senior JavaScript Developer with 6 years of experience. Expert in React, Node.js, and AWS. Masters in Computer Science.'
          },
          {
            id: 'resume2',
            content: 'Jane Smith - Junior Developer with 2 years of experience in Python and Django. Bachelor in Information Technology.'
          }
        ]
      };

      const response = await request(app)
        .post('/api/resumes/rank')
        .set('X-API-Key', apiKey)
        .send(requestBody);

      expect(response.status).toBe(200);
      expect(response.body.totalResumes).toBe(2);
      expect(response.body.rankedResumes[0].id).toBe('resume1');
      expect(response.body.rankedResumes[0].score).toBeGreaterThan(
        response.body.rankedResumes[1].score
      );
    });

    it('should return 400 for missing job description', async () => {
      const response = await request(app)
        .post('/api/resumes/rank')
        .set('X-API-Key', apiKey)
        .send({ resumes: [] });

      expect(response.status).toBe(400);
    });

    it('should return 401 for missing API key', async () => {
      const response = await request(app)
        .post('/api/resumes/rank')
        .send({ jobDescription: 'Test', resumes: [] });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/resumes/analyze', () => {
    it('should analyze a resume', async () => {
      const response = await request(app)
        .post('/api/resumes/analyze')
        .set('X-API-Key', apiKey)
        .send({
          content: 'John Doe - JavaScript Developer with 5 years experience. Skills: React, Node.js, MongoDB. Education: Bachelor in Computer Science.'
        });

      expect(response.status).toBe(200);
      expect(response.body.analysis).toBeDefined();
      expect(response.body.analysis.skills).toContain('javascript');
      expect(response.body.summary.experienceYears).toBe(5);
    });
  });
});