const { tavily } = require('@tavily/core');

const client = tavily({ apiKey: process.env.TAVILY_SEARCH_KEY });

async function tavily_search(query, options = {}) {
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
  return client.search(query, mergedOptions);
}

module.exports = { tavily_search };