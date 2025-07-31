import React, { useState, useEffect } from "react";
import "./SearchResults.css";
import queryTemplate from "./utils/templates";

const API_BASE = "http://localhost:3001/api";

function SearchResults({ searchData, onBack, initialFilters }) {
  const [filters, setFilters] = useState(initialFilters || {
    country: "",
    city: "",
    location: "",
    priceMin: "",
    priceMax: "",
    type: "",
    timeRange: "week",
    additional: "",
  });
  const [results, setResults] = useState(searchData?.results || []);
  const [answer, setAnswer] = useState(searchData?.answer || "");
  const [loading, setLoading] = useState(false);

  // 按 score 排序结果
  const sortedResults = results.sort((a, b) => (b.score || 0) - (a.score || 0));

  // 只展示score>=0.2的结果
  const threshold = 0.2;
  const filteredSortedResults = sortedResults.filter(r => (r.score ?? 0) >= threshold);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleRefineSearch = (e) => {
    e.preventDefault();
    setLoading(true);

    const query = queryTemplate(filters);

    fetch(`${API_BASE}/rag`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })
      .then((res) => res.json())
      .then((data) => {
        setResults(data.results || []);
        setAnswer(data.answer || "");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Search error:", err);
        setLoading(false);
      });
  };

  return (
    <div className="search-results-container">
      {/* Header */}
      <div className="results-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>
            ← Back to Home
          </button>
          <h1>Search Results</h1>
        </div>
        <div className="header-right">
          <div className="results-count">
            {filteredSortedResults.length} results found
          </div>
        </div>
      </div>

      <div className="results-content">
        {/* Left Sidebar - Filters */}
        <div className="filters-sidebar">
          <div className="filters-header">
            <h3>Filters</h3>
            <span className="filter-count">0 selected</span>
          </div>

          <form onSubmit={handleRefineSearch} className="filters-form">
            <div className="filter-section">
              <div className="filter-item">
                <label>Country</label>
                <input
                  name="country"
                  value={filters.country}
                  onChange={handleFilterChange}
                  placeholder="Enter country"
                />
              </div>

              <div className="filter-item">
                <label>City</label>
                <input
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                  placeholder="Enter city"
                />
              </div>

              <div className="filter-item">
                <label>Location</label>
                <input
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="Enter location"
                />
              </div>

              <div className="filter-item">
                <label>Type</label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                >
                  <option value="">Select type</option>
                  <option value="1b1b">1B1B</option>
                  <option value="2b1b">2B1B</option>
                  <option value="2b2b">2B2B</option>
                  <option value="studio">Studio</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Time Range</label>
                <select
                  name="timeRange"
                  value={filters.timeRange}
                  onChange={handleFilterChange}
                >
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Price Range</label>
                <div className="price-inputs">
                  <input
                    name="priceMin"
                    type="number"
                    value={filters.priceMin}
                    onChange={handleFilterChange}
                    placeholder="Min"
                  />
                  <span>-</span>
                  <input
                    name="priceMax"
                    type="number"
                    value={filters.priceMax}
                    onChange={handleFilterChange}
                    placeholder="Max"
                  />
                </div>
              </div>

              <div className="filter-item">
                <label>Additional Info</label>
                <textarea
                  name="additional"
                  value={filters.additional}
                  onChange={handleFilterChange}
                  placeholder="Enter additional information"
                  rows="3"
                />
              </div>
            </div>

            <button type="submit" className="refine-btn" disabled={loading}>
              {loading ? "Searching..." : "Refine Search"}
            </button>
          </form>
        </div>

        {/* Right Content - Results */}
        <div className="results-main" style={loading ? { filter: 'blur(3px)', pointerEvents: 'none', position: 'relative' } : {}}>
          {/* AI Answer */}
          {answer && (
            <div className="ai-answer">
              <h3>AI Summary</h3>
              <p>{answer}</p>
            </div>
          )}

          {/* Results List */}
          <div className="results-list">
            {filteredSortedResults.map((result, index) => (
              <div key={index} className="result-item">
                <div className="result-content">
                  <h4 className="result-title">
                    <a href={result.url} target="_blank" rel="noopener noreferrer">
                      {result.title}
                    </a>
                  </h4>
                  <p className="result-excerpt">
                    {result.content || result.rawContent || "No content available"}
                  </p>
                  <div className="result-meta">
                    <span className="result-url">{result.url}</span>
                    <span className="result-score">Score: {result.score?.toFixed(2) || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSortedResults.length === 0 && !loading && (
            <div className="no-results">
              <p>No results found. Try adjusting your filters.</p>
            </div>
          )}
          {/* Loading Spinner Overlay */}
          {loading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchResults;
