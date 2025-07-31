const express = require('express');
const router = express.Router();
const multer = require('multer');
const { tavily_search } = require('./tavily_search');
const { filterTemplate, summarizeTemplate } = require('../utils/templates');
const llmService = require('../services/llmService');
const pdfAnalysisService = require('../services/pdfAnalysisService');

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

module.exports = router;
