import React, { useState, useEffect, useRef } from "react";
import LoginRegister from "./LoginRegister";
import SearchResults from "./SearchResults";
import NearbySearch from "./components/NearbySearch";
import "./App.css";
import queryTemplate from "./utils/templates";

const API_BASE = "http://localhost:3001/api";

// localStorage keys
const STORAGE_KEYS = {
  HISTORY: 'homequest_analysis_history',
  CURRENT_FILE: 'homequest_current_file',
  CURRENT_ANALYSIS: 'homequest_current_analysis',
  SEARCH_FILTERS: 'homequest_search_filters',
  NEARBY_SEARCH: 'homequest_nearby_search',
  USERNAME: 'homequest_username',
  ACTIVE_TAB: 'homequest_active_tab'
};

function UserAvatar({ username, onClick }) {
  const initial = username ? username[0].toUpperCase() : "?";
  return (
    <div
      className="user-avatar"
      onClick={onClick}
      title="Profile"
    >
      {initial}
    </div>
  );
}

function AdvancedFilters({ onSearch, initialFilters }) {
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
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const newFilters = { ...filters, [e.target.name]: e.target.value };
    setFilters(newFilters);
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.SEARCH_FILTERS, JSON.stringify(newFilters));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const query = queryTemplate(filters);

    fetch("http://localhost:3001/api/rag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (onSearch) onSearch(data, filters);
      })
      .catch((err) => {
        console.error("Search error:", err);
        setLoading(false);
      });
  };

  return (
    <form className="filters-card" onSubmit={handleSubmit}>
      <div className="filters-tip">
        Use the filters below to refine your search.
      </div>
      <div className="filter-row">
        <label htmlFor="country">Country</label>
        <input
          id="country"
          name="country"
          placeholder="Enter country"
          value={filters.country}
          onChange={handleChange}
        />
      </div>
      <div className="filter-row">
        <label htmlFor="city">City</label>
        <input
          id="city"
          name="city"
          placeholder="Enter city"
          value={filters.city}
          onChange={handleChange}
        />
      </div>
      <div className="filter-row">
        <label htmlFor="location">Location</label>
        <input
          id="location"
          name="location"
          placeholder="Enter location"
          value={filters.location}
          onChange={handleChange}
        />
      </div>
      <div className="filter-row">
        <label htmlFor="type">Type</label>
        <select
          id="type"
          name="type"
          value={filters.type}
          onChange={handleChange}
        >
          <option value="">Select type</option>
          <option value="1b1b">1B1B</option>
          <option value="2b1b">2B1B</option>
          <option value="2b2b">2B2B</option>
          <option value="studio">Studio</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="filter-row">
        <label htmlFor="timeRange">Time Range</label>
        <select
          id="timeRange"
          name="timeRange"
          value={filters.timeRange}
          onChange={handleChange}
        >
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>
      </div>
      <div className="filter-row">
        <label>Price Range</label>
        <div className="price-range-group">
          <input
            name="priceMin"
            type="number"
            min="0"
            placeholder="Min"
            value={filters.priceMin}
            onChange={handleChange}
          />
          <span className="price-sep">-</span>
          <input
            name="priceMax"
            type="number"
            min="0"
            placeholder="Max"
            value={filters.priceMax}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="filter-row">
        <label htmlFor="additional">Additional Info</label>
        <textarea
          id="additional"
          name="additional"
          placeholder="Enter any additional information"
          value={filters.additional}
          onChange={handleChange}
        />
      </div>
      <button className="search-btn" type="submit" disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}

function FileUploadArea({ onFileUpload }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = (file) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }
    setUploading(true);
    onFileUpload(file);
    setUploading(false);
  };

  return (
    <div className="upload-area">
      <div
        className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-content">
          <div className="upload-icon">📄</div>
          <div className="upload-text">
            <div className="upload-title">Upload PDF Lease Agreement</div>
            <div className="upload-subtitle">
              Drag and drop your PDF here, or click to browse
            </div>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>
      {uploading && (
        <div className="upload-loading">
          <div className="spinner"></div>
          <span>Uploading...</span>
        </div>
      )}
    </div>
  );
}

function HistoryRecord({ record, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="history-record">
      <div className="history-header" onClick={() => setExpanded(!expanded)}>
        <div className="history-file-info">
          <span className="history-file-name">{record.fileName}</span>
          <span className="history-date">{new Date(record.timestamp).toLocaleDateString()}</span>
        </div>
        <div className="history-actions">
          <button
            className="history-expand-btn"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? '−' : '+'}
          </button>
          <button
            className="history-delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(record.id);
            }}
          >
            ×
          </button>
        </div>
      </div>
      {expanded && (
        <div className="history-content">
          <div className="history-section">
            <div className="history-section-title">Summary</div>
            <textarea
              className="history-textbox"
              value={record.summary}
              readOnly
              rows={4}
            />
          </div>
          <div className="history-section">
            <div className="history-section-title">Potential Issues</div>
            <textarea
              className="history-textbox"
              value={record.issues}
              readOnly
              rows={4}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureDescription() {
  return (
    <div className="feature-description">
      <div className="feature-title">AI-Powered Lease Analysis</div>
      <div className="feature-content">
        <div className="feature-item">
          <div className="feature-item-title">Smart Analysis</div>
          <div className="feature-item-desc">
            Our AI analyzes your lease agreement to identify key terms, potential issues, and provide a comprehensive summary.
          </div>
        </div>
        <div className="feature-item">
          <div className="feature-item-title">Privacy First</div>
          <div className="feature-item-desc">
            Your documents are processed securely and never stored permanently. All data is encrypted and deleted after analysis.
          </div>
        </div>
        <div className="feature-item">
          <div className="feature-item-title">Instant Results</div>
          <div className="feature-item-desc">
            Get detailed analysis results in seconds, including summary and potential legal concerns to watch out for.
          </div>
        </div>
      </div>
    </div>
  );
}

function PropertySearch({ onSearch, initialFilters }) {
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
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('homequest_search_history');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse search history:', e);
      }
    }
  }, []);

  // Save search history to localStorage
  useEffect(() => {
    localStorage.setItem('homequest_search_history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  const handleChange = (e) => {
    const newFilters = { ...filters, [e.target.name]: e.target.value };
    setFilters(newFilters);
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.SEARCH_FILTERS, JSON.stringify(newFilters));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const query = queryTemplate(filters);

    // Add to recent searches
    const searchRecord = {
      id: Date.now(),
      filters: { ...filters },
      timestamp: Date.now(),
      query: query
    };
    setRecentSearches([searchRecord, ...recentSearches.slice(0, 4)]); // Keep last 5 searches

    fetch("http://localhost:3001/api/rag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        // 调用父组件的handleSearch函数
        if (onSearch) {
          onSearch(data, filters);
        }

        // Add to search history
        const historyRecord = {
          id: Date.now(),
          filters: { ...filters },
          timestamp: Date.now(),
          resultCount: data.results?.length || 0
        };
        setSearchHistory([historyRecord, ...searchHistory.slice(0, 9)]); // Keep last 10 searches
      })
      .catch((err) => {
        console.error("Search error:", err);
        setLoading(false);
      });
  };

  const handleQuickSearch = (searchRecord) => {
    setFilters(searchRecord.filters);
    localStorage.setItem(STORAGE_KEYS.SEARCH_FILTERS, JSON.stringify(searchRecord.filters));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    setRecentSearches([]);
    localStorage.removeItem('homequest_search_history');
  };

  return (
    <div className="property-search-content">
      {/* Feature Description */}
      <div className="feature-description">
        <div className="feature-title">AI-Powered Property Search</div>
        <div className="feature-content">
          <div className="feature-item">
            <div className="feature-item-title">Smart Matching</div>
            <div className="feature-item-desc">
              Our AI analyzes your preferences and matches you with the best properties from our extensive database.
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-item-title">Advanced Filters</div>
            <div className="feature-item-desc">
              Refine your search with location, price range, property type, and additional requirements.
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-item-title">Real-time Results</div>
            <div className="feature-item-desc">
              Get instant access to the latest property listings with detailed information and insights.
            </div>
          </div>
        </div>
      </div>

      <div className="search-main-content">
        {/* Left Column - Search Form */}
        <div className="search-form-section">
          <div className="search-form-card">
            <div className="search-form-header">
              <h3>Search Properties</h3>
              <div className="search-form-subtitle">
                Use the filters below to find your perfect home
              </div>
            </div>

            <form onSubmit={handleSubmit} className="search-form">
              <div className="form-section">
                <div className="section-title">Location</div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <input
                      id="country"
                      name="country"
                      placeholder="Enter country"
                      value={filters.country}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      id="city"
                      name="city"
                      placeholder="Enter city"
                      value={filters.city}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="location">Specific Location</label>
                  <input
                    id="location"
                    name="location"
                    placeholder="Enter specific location or neighborhood"
                    value={filters.location}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-section">
                <div className="section-title">Property Details</div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="type">Property Type</label>
                    <select
                      id="type"
                      name="type"
                      value={filters.type}
                      onChange={handleChange}
                    >
                      <option value="">Any Type</option>
                      <option value="1b1b">1 Bedroom 1 Bath</option>
                      <option value="2b1b">2 Bedroom 1 Bath</option>
                      <option value="2b2b">2 Bedroom 2 Bath</option>
                      <option value="studio">Studio</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="timeRange">Time Range</label>
                    <select
                      id="timeRange"
                      name="timeRange"
                      value={filters.timeRange}
                      onChange={handleChange}
                    >
                      <option value="day">Last Day</option>
                      <option value="week">Last Week</option>
                      <option value="month">Last Month</option>
                      <option value="year">Last Year</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-title">Price Range</div>
                <div className="price-range-section">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="priceMin">Minimum Price</label>
                      <input
                        id="priceMin"
                        name="priceMin"
                        type="number"
                        min="0"
                        placeholder="Min"
                        value={filters.priceMin}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="priceMax">Maximum Price</label>
                      <input
                        id="priceMax"
                        name="priceMax"
                        type="number"
                        min="0"
                        placeholder="Max"
                        value={filters.priceMax}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-title">Additional Requirements</div>
                <div className="form-group">
                  <label htmlFor="additional">Additional Information</label>
                  <textarea
                    id="additional"
                    name="additional"
                    placeholder="Enter any additional requirements, preferences, or specific features you're looking for..."
                    value={filters.additional}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="search-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <span className="search-icon">🔍</span>
                      Search Properties
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column - Recent Searches & Tips */}
        <div className="search-sidebar">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="sidebar-card">
              <div className="sidebar-card-header">
                <h4>Recent Searches</h4>
                <button className="clear-btn-small" onClick={clearHistory}>
                  Clear
                </button>
              </div>
              <div className="recent-searches">
                {recentSearches.map((search) => (
                  <div
                    key={search.id}
                    className="recent-search-item"
                    onClick={() => handleQuickSearch(search)}
                  >
                    <div className="search-summary">
                      <div className="search-location">
                        {search.filters.city || search.filters.country || 'Any Location'}
                      </div>
                      <div className="search-details">
                        {search.filters.type && `${search.filters.type} • `}
                        {search.filters.priceMin && search.filters.priceMax
                          ? `$${search.filters.priceMin}-$${search.filters.priceMax}`
                          : 'Any Price'
                        }
                      </div>
                    </div>
                    <div className="search-time">
                      {new Date(search.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Tips */}
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <h4>Search Tips</h4>
            </div>
            <div className="search-tips">
              <div className="tip-item">
                <div className="tip-icon">💡</div>
                <div className="tip-content">
                  <div className="tip-title">Be Specific</div>
                  <div className="tip-desc">Include specific neighborhoods or landmarks for better results</div>
                </div>
              </div>
              <div className="tip-item">
                <div className="tip-icon">💰</div>
                <div className="tip-content">
                  <div className="tip-title">Set Price Range</div>
                  <div className="tip-desc">Define your budget to filter out unsuitable options</div>
                </div>
              </div>
              <div className="tip-item">
                <div className="tip-icon">🏠</div>
                <div className="tip-content">
                  <div className="tip-title">Property Type</div>
                  <div className="tip-desc">Choose the right property type for your needs</div>
                </div>
              </div>
              <div className="tip-item">
                <div className="tip-icon">📝</div>
                <div className="tip-content">
                  <div className="tip-title">Additional Info</div>
                  <div className="tip-desc">Mention specific features like parking, pets, or amenities</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RentLeaseAnalysis() {
  const [pdfFile, setPdfFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    const savedAnalysis = localStorage.getItem(STORAGE_KEYS.CURRENT_ANALYSIS);
    const savedFile = localStorage.getItem(STORAGE_KEYS.CURRENT_FILE);

    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse saved history:', e);
      }
    }

    if (savedAnalysis) {
      try {
        setAnalysis(JSON.parse(savedAnalysis));
      } catch (e) {
        console.error('Failed to parse saved analysis:', e);
      }
    }

    if (savedFile) {
      try {
        const fileData = JSON.parse(savedFile);
        // Note: We can't fully restore the File object, but we can show the filename
        setPdfFile({ name: fileData.name, size: fileData.size });
      } catch (e) {
        console.error('Failed to parse saved file:', e);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }, [history]);

  // Save current analysis to localStorage whenever it changes
  useEffect(() => {
    if (analysis) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_ANALYSIS, JSON.stringify(analysis));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_ANALYSIS);
    }
  }, [analysis]);

  // Save current file info to localStorage whenever it changes
  useEffect(() => {
    if (pdfFile && !pdfFile.isRestored) { // 只保存真实上传的文件，不保存恢复的文件
      localStorage.setItem(STORAGE_KEYS.CURRENT_FILE, JSON.stringify({
        name: pdfFile.name,
        size: pdfFile.size
      }));
    } else if (!pdfFile) {
      // 当文件被清除时，也清除localStorage中的数据
      localStorage.removeItem(STORAGE_KEYS.CURRENT_FILE);
    }
  }, [pdfFile]);

  const handleFileUpload = (file) => {
    setPdfFile(file);
    setError("");
    setAnalysis(null);
  };

  const handleDelete = () => {
    setPdfFile(null);
    setAnalysis(null);
    setError("");
  };

  const handleDeleteHistory = (id) => {
    const newHistory = history.filter(record => record.id !== id);
    setHistory(newHistory);
  };

  useEffect(() => {
    if (!pdfFile || !pdfFile.size) return; // Skip if it's just a restored filename

    setLoading(true);
    setAnalysis(null);
    setError("");

    const formData = new FormData();
    formData.append("pdf", pdfFile);

    fetch(`${API_BASE}/analyze-pdf`, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Analysis result:', data);
        if (data.error) {
          setError(data.error);
        } else {
          setAnalysis(data);
          // Add to history
          const newRecord = {
            id: Date.now(),
            fileName: pdfFile.name,
            timestamp: Date.now(),
            summary: data.summary || '',
            issues: data.issues || ''
          };
          setHistory([newRecord, ...history]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Analysis error:', err);
        // Handle rate limiting and other errors
        if (err.message && err.message.includes('Rate limited')) {
          setError("Service temporarily unavailable due to high demand. Please try again in a few minutes.");
        } else {
          setError("Failed to analyze PDF. Please try again later.");
        }
        setLoading(false);
      });
  }, [pdfFile]);

  return (
    <div className="rent-lease-content">
      <FeatureDescription />

      <div className="upload-section">
        <FileUploadArea onFileUpload={handleFileUpload} />
      </div>

      {loading && (
        <div className="analysis-loading">
          <div className="spinner"></div>
          <span>Analyzing PDF...</span>
        </div>
      )}

      {error && <div className="analysis-error">{error}</div>}

      {analysis && (
        <div className="analysis-result">
          <div className="analysis-header">
            <h3>Analysis Results</h3>
            <button className="delete-btn" onClick={handleDelete}>
              Clear
            </button>
          </div>
          <div className="analysis-sections">
            <div className="analysis-section">
              <div className="analysis-section-title">Summary</div>
              <textarea
                className="analysis-textbox"
                value={analysis.summary || ''}
                readOnly
                rows={6}
              />
            </div>
            <div className="analysis-section">
              <div className="analysis-section-title">Potential Issues</div>
              <textarea
                className="analysis-textbox"
                value={analysis.issues || ''}
                readOnly
                rows={6}
              />
            </div>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="history-section">
          <h3>Analysis History</h3>
          <div className="history-list">
            {history.map((record) => (
              <HistoryRecord
                key={record.id}
                record={record}
                onDelete={handleDeleteHistory}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarNavigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'rent-lease', label: 'Lease Analysis' },
    { id: 'search-filters', label: 'Property Search' },
    { id: 'nearby-search', label: 'Nearby Search' }
  ];

  return (
    <div className="sidebar-navigation">
      <div className="sidebar-title">Services</div>
      <div className="sidebar-divider"></div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </div>
      ))}
    </div>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const [showProfile, setShowProfile] = useState(false);
  const [username, setUsername] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [currentFilters, setCurrentFilters] = useState(null);
  const [activeTab, setActiveTab] = useState('rent-lease');

  // Load saved data from localStorage on app mount
  useEffect(() => {
    // Load username
    const savedUsername = localStorage.getItem(STORAGE_KEYS.USERNAME);
    if (savedUsername) {
      setUsername(savedUsername);
    }

    // Load active tab
    const savedTab = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
    if (savedTab) {
      setActiveTab(savedTab);
    }

    // Load search filters
    const savedFilters = localStorage.getItem(STORAGE_KEYS.SEARCH_FILTERS);
    if (savedFilters) {
      try {
        setCurrentFilters(JSON.parse(savedFilters));
      } catch (e) {
        console.error('Failed to parse saved filters:', e);
      }
    }
  }, []);

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (loggedIn) {
      fetch(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
        .then((res) => res.json())
        .then((data) => {
          const user = data.username || "";
          setUsername(user);
          localStorage.setItem(STORAGE_KEYS.USERNAME, user);
        })
        .catch(() => {
          setUsername("");
          localStorage.removeItem(STORAGE_KEYS.USERNAME);
        });
    }
  }, [loggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem(STORAGE_KEYS.USERNAME);
    setLoggedIn(false);
    setShowProfile(false);
    setUsername("");
    setSearchResults(null);
    setCurrentFilters(null);
  };

  const handleSearch = (data, filters) => {
    setSearchResults(data);
    setCurrentFilters(filters);
  };

  const handleBackToHome = () => {
    setSearchResults(null);
    // 不重置 currentFilters，这样返回时 filter 内容会保留
  };

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'rent-lease':
        return <RentLeaseAnalysis />;
      case 'search-filters':
        return <PropertySearch onSearch={handleSearch} initialFilters={currentFilters} />;
      case 'nearby-search':
        return <NearbySearch />;
      default:
        return <RentLeaseAnalysis />;
    }
  };

  // 如果正在显示搜索结果
  if (searchResults) {
    return (
      <div>
        <nav className="navbar">
          <div className="navbar-title">HomeQuest</div>
          {loggedIn && (
            <UserAvatar
              username={username}
              onClick={() => setShowProfile((v) => !v)}
            />
          )}
        </nav>
        <SearchResults
          searchData={searchResults}
          initialFilters={currentFilters}
          onBack={handleBackToHome}
        />
      </div>
    );
  }

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-title">HomeQuest</div>
        {loggedIn && (
          <UserAvatar
            username={username}
            onClick={() => setShowProfile((v) => !v)}
          />
        )}
      </nav>
      <div className="main-content">
        {!loggedIn ? (
          <LoginRegister onLogin={() => setLoggedIn(true)} />
        ) : showProfile ? (
          <div className="profile-card">
            <h2>Profile</h2>
            <div><b>Username:</b> {username}</div>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div className="new-layout">
            <div className="sidebar">
              <SidebarNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
            <div className="content-area">
              {renderActiveContent()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;