const { tavily } = require('@tavily/core');

const client = tavily({ apiKey: process.env.TAVILY_SEARCH_KEY });

async function tavily_search(query, options = {}) {
  try {
    if (!query || typeof query !== 'string') {
      throw new Error('Query must be a non-empty string');
    }

    const defaultOptions = {
      searchDepth: "advanced",
      maxResults: 7,
      timeRange: "week",
      includeAnswer: "advanced",
      includeImages: true,
      includeRawContent: "text",
      country: "canada"
    };
    const mergedOptions = { ...defaultOptions, ...options };

    console.log('Tavily search options:', mergedOptions);
    const results = await client.search(query, mergedOptions);

    // 验证返回结果
    if (!results) {
      console.warn('Tavily search returned null/undefined');
      return { results: [], answer: 'No results found' };
    }

    // Tavily API返回的是包含answer和results字段的对象
    if (typeof results === 'object' && results.results && Array.isArray(results.results)) {
      console.log(`Tavily search returned ${results.results.length} results with answer`);
      return results; // 直接返回完整对象
    }

    // 如果返回的是数组（旧格式），转换为新格式
    if (Array.isArray(results)) {
      console.log(`Tavily search returned array with ${results.length} results`);
      return {
        results: results,
        answer: 'Search completed successfully',
        query: query
      };
    }

    console.warn('Unexpected Tavily search result format:', typeof results, results);
    return { results: [], answer: 'Search failed - unexpected format' };

  } catch (error) {
    console.error('Tavily search error:', error);
    throw new Error(`Tavily search failed: ${error.message}`);
  }
}

module.exports = { tavily_search };