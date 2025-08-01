# HomeQuest - AI-Powered Real Estate Platform

A comprehensive real estate platform that combines AI-powered search, PDF lease analysis, and nearby facility search to help users find their perfect home.

## 🚀 Features

### 1. **AI-Powered Property Search**
- Advanced filtering with multiple criteria
- AI-enhanced search results
- Real-time property recommendations

### 2. **Rent Lease Analysis**
- PDF upload and analysis
- AI-powered contract review
- Summary and potential issues identification
- Copy-to-clipboard functionality

### 3. **Nearby Search**
- Address-based location search
- Google Maps integration
- Categorized nearby facilities:
  - 🏥 Hospitals & Medical Centers
  - 🍽️ Restaurants & Cafes
  - 🚇 Transportation Hubs
  - 🎓 Schools & Universities
  - 🛍️ Shopping Centers
  - 🌳 Parks & Recreation
  - 🏦 Banks & ATMs
  - 💊 Pharmacies

## 🛠️ Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Google Maps API key

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Express-project
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Configuration**

   Create a `.env` file in the `server` directory:
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string

   # JWT
   JWT_SECRET=your_jwt_secret_key

   # OpenRouter API (for LLM)
   OPENROUTER_API_KEY=your_openrouter_api_key

   # Google Maps API
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. **Google Maps API Setup**

   You'll need to enable the following Google Maps APIs:
   - **Geocoding API**: For converting addresses to coordinates
   - **Places API**: For searching nearby places

   Get your API key from [Google Cloud Console](https://console.cloud.google.com/)

5. **Start the application**
   ```bash
   # Start the server (from server directory)
   cd server
   npm start

   # Start the client (from client directory)
   cd client
   npm start
   ```

## 📁 Project Structure

```
Express-project/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   └── NearbySearch.js
│   │   ├── utils/          # Utility functions
│   │   └── ...
├── server/                 # Node.js backend
│   ├── services/           # Business logic services
│   │   ├── llmService.js
│   │   ├── pdfAnalysisService.js
│   │   └── googleMapsService.js
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   └── ...
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile

### Property Search
- `POST /api/search` - AI-powered property search
- `POST /api/rag` - RAG-enhanced search

### PDF Analysis
- `POST /api/analyze-pdf` - Analyze PDF lease documents

### Nearby Search
- `POST /api/geocode` - Convert address to coordinates
- `POST /api/nearby-search` - Search for nearby places
- `GET /api/place-details/:placeId` - Get detailed place information

## 🎨 UI Features

### Responsive Design
- Three-column layout on desktop
- Responsive design for tablets and mobile
- Consistent styling across all components

### User Experience
- Loading indicators with spinners
- Error handling with user-friendly messages
- Copy-to-clipboard functionality
- Clear and intuitive interface

## 🔒 Security

- JWT-based authentication
- Environment variable protection
- Input validation and sanitization
- Secure file upload handling

## 🚀 Deployment

### Backend Deployment
1. Set up environment variables on your hosting platform
2. Deploy to your preferred Node.js hosting service (Heroku, Vercel, etc.)

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy to your preferred static hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.