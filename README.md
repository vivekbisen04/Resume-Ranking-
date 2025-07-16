# Resume Ranking API

A robust Node.js backend service that ranks resumes based on their relevance to job descriptions using natural language processing and customizable scoring algorithms.

## 🚀 Features

### Core Features
- ✅ **RESTful API** for resume ranking
- ✅ **Resume parsing** (PDF, DOCX, TXT)
- ✅ **Intelligent relevance scoring** using NLP
- ✅ **Customizable ranking weights**
- ✅ **Comprehensive error handling**
- ✅ **Request logging**
- ✅ **API documentation** (Swagger)

### Bonus Features
- ✅ **JWT & API Key authentication**
- ✅ **Multiple file format support**
- ✅ **Bulk processing** (up to 50 resumes)
- ✅ **Configurable ranking criteria**
- ✅ **Unit and integration tests**

## 🛠️ Tech Stack

- **Runtime**: Node.js (v14+)
- **Framework**: Express.js
- **Authentication**: JWT & API Keys
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **NLP**: Natural
- **File Parsing**: pdf-parse, mammoth
- **Database**: In-memory (can be extended to MongoDB/PostgreSQL)

## 📦 Installation

1. **Clone the repository**:
```bash
git clone https://github.com/vivekbisen04/Resume-Ranking-.git
cd resume-ranking-api
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
```bash
# Create .env file
cp .env.example .env

# Edit .env with your configuration
```

4. **Start the development server**:
```bash
npm run dev
```

The server will start on `http://localhost:3001`

## 🔧 Configuration

### Environment Variables

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-jwt-secret-here
API_KEY=default-api-key-secret
LOG_LEVEL=info
MAX_FILE_SIZE=10MB
MAX_FILES_PER_REQUEST=50
```

### Default Scoring Weights

```javascript
{
  skills: 0.35,      // 35% weight on skills matching
  experience: 0.25,  // 25% weight on experience relevance
  education: 0.2,    // 20% weight on education background
  keywords: 0.2      // 20% weight on keyword matching
}
```

## 🔐 Authentication

The API supports two authentication methods:

### 1. JWT Token Authentication
```javascript
// Login to get JWT token
POST /api/auth/login
{
  "username": "vivek",
  "password": "password"
}

// Use token in subsequent requests
Authorization: Bearer <jwt-token>
```

### 2. API Key Authentication
```javascript
// Use API key in header
X-API-Key: your-api-key-here
```

## 📚 API Documentation

Once the server is running, visit:
- **API Endpoints**: `http://localhost:3001/api/`

##  API Endpoints

### Authentication
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/register` - Register new user

### Resume Ranking
- `POST /api/rank` - Rank resumes against job description
- `POST /api/rank/bulk` - Bulk rank multiple resumes
- `GET /api/rank/history` - Get ranking history

### Configuration
- `GET /api/config/weights` - Get current scoring weights
- `PUT /api/config/weights` - Update scoring weights

## 📋 Usage Examples

### Basic Resume Ranking

```javascript
// Single resume ranking
const formData = new FormData();
formData.append('resume', resumeFile);
formData.append('jobDescription', 'Senior JavaScript Developer with 5+ years...');

const response = await fetch('http://localhost:3001/api/rank', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <jwt-token>',
    'X-API-Key': 'your-api-key'
  },
  body: formData
});
```

### Bulk Resume Ranking

```javascript
// Multiple resumes ranking
const formData = new FormData();
formData.append('resumes', resume1File);
formData.append('resumes', resume2File);
formData.append('jobDescription', jobDescription);
formData.append('weights', JSON.stringify({
  skills: 0.4,
  experience: 0.3,
  education: 0.2,
  keywords: 0.1
}));

const response = await fetch('http://localhost:3001/api/rank/bulk', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <jwt-token>'
  },
  body: formData
});
```

### Custom Scoring Weights

```javascript
// Update scoring weights
const response = await fetch('http://localhost:3001/api/config/weights', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <jwt-token>'
  },
  body: JSON.stringify({
    skills: 0.4,
    experience: 0.3,
    education: 0.15,
    keywords: 0.15
  })
});
```


## 📊 Response Format

### Successful Ranking Response

```json
{
  "success": true,
  "results": [
    {
      "filename": "vivek_resume.pdf",
      "score": 0.78,
      "breakdown": {
        "skills": 0.85,
        "experience": 0.75,
        "education": 0.70,
        "keywords": 0.80
      },
      "extractedData": {
        "skills": ["javascript", "python", "react", "node.js"],
        "experience": "5 years",
        "education": "Bachelor of Technology in Computer Science",
        "contact": {
          "email": "kp064669@gmail.com",
          "phone": "8591253280"
        }
      },
      "rank": 1
    }
  ],
  "metadata": {
    "totalResumes": 1,
    "processingTime": "2.5s",
    "weights": {
      "skills": 0.35,
      "experience": 0.25,
      "education": 0.2,
      "keywords": 0.2
    }
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_FORMAT",
    "message": "Only PDF, DOCX, and TXT files are supported",
    "details": "File 'resume.jpg' has unsupported format"
  }
}
```

##  Ranking Algorithm

The ranking algorithm uses a weighted scoring system:

1. **Skills Matching** (35% default weight)
   - Extracts technical skills from resume
   - Matches against job requirements
   - Uses fuzzy matching for variations

2. **Experience Relevance** (25% default weight)
   - Analyzes work experience duration
   - Matches job roles and responsibilities
   - Considers career progression

3. **Education Background** (20% default weight)
   - Evaluates degree relevance
   - Considers educational achievements
   - Matches field of study

4. **Keywords Matching** (20% default weight)
   - Identifies important keywords in job description
   - Searches for keyword presence in resume
   - Considers keyword frequency and context


