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

