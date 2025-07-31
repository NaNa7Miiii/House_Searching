// Consolidated templates for both server and client use
// 1. Query Template for frontend search
const queryTemplate = ({
  country,
  city,
  location,
  type,
  priceMin,
  priceMax,
  timeRange,
  additional,
}) => {
  let parts = ["Find homes"];

  if (country || city) {
    let locationStr = [country, city].filter(Boolean).join(", ");
    if (locationStr) parts.push(`in ${locationStr}`);
  }

  if (location) {
    parts.push(`(specific location: ${location})`);
  }

  if (type) {
    parts.push(`of type "${type}"`);
  }

  if (priceMin || priceMax) {
    let priceStr = "with price";
    if (priceMin && priceMax) {
      priceStr += ` between $${priceMin} and $${priceMax}`;
    } else if (priceMin) {
      priceStr += ` from $${priceMin}`;
    } else if (priceMax) {
      priceStr += ` up to $${priceMax}`;
    }
    parts.push(priceStr);
  }

  if (timeRange) {
    parts.push(`available in the time range: ${timeRange}`);
  }

  let query = parts.join(" ") + ".";

  if (additional) {
    query += ` Additional requirements: ${additional}`;
  }

  return query.trim();
};

// 2. PDF Analysis Templates
const pdfAnalysisTemplates = {
  chunkAnalysis: (chunk, chunkIndex) => `Analyze this part of a rental agreement contract (Part ${chunkIndex + 1}):

${chunk}

Please provide:
1. Key terms and conditions in this section
2. Important obligations or rights mentioned
3. Any potential issues or concerns

Format your response in bullet points.`,

  summaryGeneration: (combinedSummaries) => `Based on the following analyses of a rental agreement contract, provide a comprehensive summary:

${combinedSummaries}

Please provide:
1. Overall contract type and purpose
2. Key terms and conditions
3. Important obligations for both parties
4. Payment and deposit requirements
5. Duration and termination clauses`,

  issuesIdentification: (combinedSummaries) => `Based on the following rental agreement analysis, identify potential problems and issues:

${combinedSummaries}

Please identify:
1. Unfair or one-sided clauses
2. Vague or ambiguous terms
3. Missing important protections
4. Potential legal compliance issues
5. Recommendations for improvement

Focus on issues that could cause problems for either party.`
};

module.exports = {
  queryTemplate,
  pdfAnalysisTemplates
};