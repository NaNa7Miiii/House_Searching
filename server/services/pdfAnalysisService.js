const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const llmService = require('./llmService');

class PDFAnalysisService {
  // Extract text from PDF file
  async extractPdfText(filePath) {
    try {
      console.log(`Reading PDF file: ${filePath}`);
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      console.log(`PDF read successfully, ${data.text.length} characters`);
      return data.text;
    } catch (error) {
      console.error('PDF reading failed:', error.message);
      throw error;
    }
  }

  // Split text into chunks (approximately 4000 tokens per chunk for safety)
  splitTextIntoChunks(text, maxTokens = 4000) {
    // Rough estimation: 1 token ≈ 4 characters for Chinese text
    const maxChars = maxTokens * 4;
    const chunks = [];

    for (let i = 0; i < text.length; i += maxChars) {
      chunks.push(text.slice(i, i + maxChars));
    }

    console.log(`Split text into ${chunks.length} chunks`);
    return chunks;
  }

  // Analyze each chunk and generate summary
  async analyzeChunk(chunk, chunkIndex) {
    const prompt = `Analyze this part of a rental agreement contract (Part ${chunkIndex + 1}):

${chunk}

Please provide:
1. Key terms and conditions in this section
2. Important obligations or rights mentioned
3. Any potential issues or concerns

Format your response in bullet points.`;

    try {
      const analysis = await llmService.analyzeContent(prompt);
      return analysis;
    } catch (error) {
      console.error(`Chunk ${chunkIndex + 1} analysis failed:`, error.message);
      return `Analysis failed for chunk ${chunkIndex + 1}`;
    }
  }

  // Generate global summary from all chunk summaries
  async generateGlobalSummary(chunkSummaries) {
    const combinedSummaries = chunkSummaries.join('\n\n---\n\n');

    const summaryPrompt = `Based on the following analyses of a rental agreement contract, provide a comprehensive summary:

${combinedSummaries}

Please provide:
1. Overall contract type and purpose
2. Key terms and conditions
3. Important obligations for both parties
4. Payment and deposit requirements
5. Duration and termination clauses`;

    const issuesPrompt = `Based on the following rental agreement analysis, identify potential problems and issues:

${combinedSummaries}

Please identify:
1. Unfair or one-sided clauses
2. Vague or ambiguous terms
3. Missing important protections
4. Potential legal compliance issues
5. Recommendations for improvement

Focus on issues that could cause problems for either party.`;

    try {
      console.log('Generating global summary...');
      const summary = await llmService.analyzeContent(summaryPrompt);

      console.log('Identifying potential issues...');
      const issues = await llmService.analyzeContent(issuesPrompt);

      return { summary, issues };
    } catch (error) {
      console.error('Global analysis failed:', error.message);
      throw error;
    }
  }

  // Main analysis function
  async analyzePdfContent(pdfText) {
    try {
      // Split text into manageable chunks
      const chunks = this.splitTextIntoChunks(pdfText);

      // Analyze each chunk
      console.log('\nAnalyzing individual chunks...');
      const chunkAnalyses = [];

      for (let i = 0; i < chunks.length; i++) {
        console.log(`\nProcessing chunk ${i + 1}/${chunks.length}...`);
        const analysis = await this.analyzeChunk(chunks[i], i);
        chunkAnalyses.push(analysis);
      }

      // Generate global summary and identify issues
      console.log('\nGenerating final analysis...');
      const finalAnalysis = await this.generateGlobalSummary(chunkAnalyses);

      return finalAnalysis;
    } catch (error) {
      console.error('PDF analysis failed:', error.message);
      throw error;
    }
  }

  // Process uploaded PDF file
  async processUploadedPdf(fileBuffer) {
    try {
      // Save the uploaded PDF to a temp file
      const tempPath = path.join(__dirname, '../', 'temp_upload_' + Date.now() + '.pdf');
      fs.writeFileSync(tempPath, fileBuffer);

      // Extract text and analyze
      const pdfText = await this.extractPdfText(tempPath);
      const analysis = await this.analyzePdfContent(pdfText);

      // Delete temp file
      fs.unlinkSync(tempPath);

      return analysis;
    } catch (error) {
      console.error('PDF processing failed:', error.message);
      throw error;
    }
  }
}

module.exports = new PDFAnalysisService();