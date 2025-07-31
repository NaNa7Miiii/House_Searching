const express = require('express');
const router = express.Router();
const multer = require('multer');
const { tavily_search } = require('./tavily_search');
const { filterTemplate, summarizeTemplate } = require('../utils/templates');
const llmService = require('../services/llmService');
const pdfAnalysisService = require('../services/pdfAnalysisService');
const googleMapsService = require('../services/googleMapsService');

// Set up multer for PDF upload (store in memory)
const upload = multer({ storage: multer.memoryStorage() });

// Search endpoint
router.post('/search', async (req, res) => {
  const { prompt } = req.body;

  try {
    const data = await llmService.searchQuery(prompt);
    res.json({ choices: [{ message: { content: data } }] });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'search failed: ' + err.message });
  }
});

// PDF analysis endpoint
router.post('/analyze-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded.' });
    }

    const analysis = await pdfAnalysisService.processUploadedPdf(req.file.buffer);
    res.json({ summary: analysis.summary, issues: analysis.issues });
  } catch (error) {
    res.status(500).json({ error: error.message || 'PDF analysis failed.' });
  }
});

// RAG endpoint
router.post('/rag', async (req, res) => {
  const { query } = req.body;

  try {
    // 1. Use Tavily search
    const searchResults = await tavily_search(query);
    console.log('Search results:', searchResults.length, 'items');

    // 2. Build prompt
    const prompt = filterTemplate(query, searchResults);

    // 3. Call LLM
    const answer = await llmService.searchQuery(prompt);

    // 4. Return results
    res.json({
      answer,
      results: searchResults
    });

  } catch (error) {
    console.error('RAG error:', error);
    res.status(500).json({ error: 'RAG processing failed' });
  }
});

// Google Maps - Geocode address
router.post('/geocode', async (req, res) => {
  const { address } = req.body;

  try {
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    const location = await googleMapsService.geocodeAddress(address);
    res.json(location);
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ error: error.message || 'Geocoding failed' });
  }
});

// Google Maps - Search nearby places
router.post('/nearby-search', async (req, res) => {
  const { address, radius = 1000 } = req.body;

  try {
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    // First geocode the address
    const location = await googleMapsService.geocodeAddress(address);

    // Then search for nearby places
    const nearbyPlaces = await googleMapsService.searchMultipleTypes(
      location.lat,
      location.lng,
      radius
    );

    res.json({
      location,
      nearbyPlaces
    });
  } catch (error) {
    console.error('Nearby search error:', error);
    res.status(500).json({ error: error.message || 'Nearby search failed' });
  }
});

// Google Maps - Get place details
router.get('/place-details/:placeId', async (req, res) => {
  const { placeId } = req.params;

  try {
    const details = await googleMapsService.getPlaceDetails(placeId);
    res.json(details);
  } catch (error) {
    console.error('Place details error:', error);
    res.status(500).json({ error: error.message || 'Failed to get place details' });
  }
});

module.exports = router;
