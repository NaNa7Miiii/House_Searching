# Elegantrix - AI-Powered Real Estate Platform

A modern real estate platform with AI-powered search and PDF contract analysis capabilities.

## Features

- **AI-Powered Search**: Intelligent property search with natural language queries
- **PDF Contract Analysis**: Upload and analyze rental agreements with LLM
- **User Authentication**: Secure login/register system
- **Advanced Filtering**: Location, price, property type, and time-based filters
- **Real-time Results**: Instant search results with relevance scoring

## Project Structure

```
Express-project/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── utils/          # Frontend utilities
│   │   └── styles/         # CSS files
├── server/                 # Express backend
│   ├── services/           # Business logic services
│   │   ├── llmService.js   # LLM API integration
│   │   └── pdfAnalysisService.js # PDF processing
│   ├── routes/             # API routes
│   ├── utils/              # Backend utilities
│   ├── models/             # Database models
│   └── middleware/         # Express middleware
```

## Tech Stack

### Frontend
- React 18
- CSS3 with custom styling
- Fetch API for HTTP requests

### Backend
- Node.js with Express
- MongoDB with Mongoose
- PDF parsing with pdf-parse
- LLM integration with OpenRouter API
- Tavily search integration

## Setup Instructions

### Prerequisites
- Node.js 16+
- MongoDB (optional, for user authentication)
- OpenRouter API key
- Tavily API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Express-project
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Environment Configuration**

   Create `.env` file in the server directory:
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key
   TAVILY_API_KEY=your_tavily_api_key
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. **Start the application**
   ```bash
   # Start backend server (from server directory)
   npm start

   # Start frontend (from client directory)
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile

### Search & Analysis
- `POST /api/search` - Direct LLM search
- `POST /api/rag` - RAG-powered search with Tavily
- `POST /api/analyze-pdf` - PDF contract analysis

## Key Features

### PDF Contract Analysis
- Upload rental agreement PDFs
- Automatic text extraction and chunking
- LLM-powered analysis for:
  - Contract summary
  - Potential issues identification
  - Risk assessment
- Copy-to-clipboard functionality

### AI Search
- Natural language property queries
- Advanced filtering options
- Relevance scoring
- Real-time results

## Development

### Code Organization
- **Services**: Business logic separated into dedicated service classes
- **Routes**: Clean API endpoint definitions
- **Utils**: Shared utilities and templates
- **Components**: Reusable React components

### Error Handling
- Comprehensive error handling with retry mechanisms
- Rate limiting protection (429 errors)
- Detailed error logging and user feedback

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.