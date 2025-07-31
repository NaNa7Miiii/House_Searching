const fetch = require('node-fetch');

// Centralized LLM service with retry mechanism
class LLMService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.baseUrl = "https://openrouter.ai/api/v1/chat/completions";
    this.defaultModel = "meta-llama/llama-3.3-70b-instruct:free";
  }

  async callLLM(prompt, model = this.defaultModel, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (!this.apiKey) {
          throw new Error('Missing OPENROUTER_API_KEY environment variable');
        }

        const response = await fetch(this.baseUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "model": model,
            "messages": [
              {
                "role": "user",
                "content": prompt
              }
            ],
            "max_tokens": 2000,
            "temperature": 0.7
          })
        });

        if (response.status === 429) {
          // Rate limited - retry with exponential backoff
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
            console.log(`Rate limited (429). Retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          } else {
            throw new Error(`Rate limited after ${maxRetries} attempts`);
          }
        }

        if (!response.ok) {
          // Try to get error details from response
          let errorDetails = '';
          try {
            const errorText = await response.text();
            errorDetails = `Response: ${errorText.substring(0, 200)}`;
          } catch (e) {
            errorDetails = 'Could not read error response';
          }
          throw new Error(`API request failed: ${response.status} ${response.statusText}. ${errorDetails}`);
        }

        // Check if response has content
        const responseText = await response.text();
        if (!responseText || responseText.trim() === '') {
          throw new Error('Empty response from API');
        }

        // Try to parse JSON
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('JSON parse error. Response text:', responseText.substring(0, 500));
          throw new Error(`Invalid JSON response: ${parseError.message}. Response preview: ${responseText.substring(0, 100)}`);
        }

        // Extract content
        const content = data.choices?.[0]?.message?.content?.trim();
        if (!content) {
          console.error('No content in response. Full response:', JSON.stringify(data, null, 2));
          throw new Error('No content in API response');
        }

        return content;
      } catch (error) {
        if (attempt === maxRetries) {
          console.error(`LLM API call failed after ${maxRetries} attempts:`, error.message);
          throw error;
        }

        // For network errors or JSON parse errors, wait before retrying
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`API call failed (${error.message}). Retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Specialized method for search queries
  async searchQuery(prompt) {
    return this.callLLM(prompt);
  }

  // Specialized method for PDF analysis
  async analyzeContent(prompt) {
    return this.callLLM(prompt);
  }
}

module.exports = new LLMService();