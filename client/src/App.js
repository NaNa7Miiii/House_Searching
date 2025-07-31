import React, { useState, useEffect, useRef } from "react";
import LoginRegister from "./LoginRegister";
import SearchResults from "./SearchResults";
import "./App.css";
import queryTemplate from "./utils/templates";

const API_BASE = "http://localhost:3001/api";

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
    setFilters({ ...filters, [e.target.name]: e.target.value });
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

function RentLeaseAnalysis() {
  const [pdfFile, setPdfFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedIssues, setCopiedIssues] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setError("");
    setAnalysis(null);
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleDelete = () => {
    setPdfFile(null);
    setAnalysis(null);
    setError("");
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'summary') {
        setCopiedSummary(true);
        setTimeout(() => {
          setCopiedSummary(false);
        }, 3000);
      } else if (type === 'issues') {
        setCopiedIssues(true);
        setTimeout(() => {
          setCopiedIssues(false);
        }, 3000);
      }
    });
  };

  useEffect(() => {
    if (!pdfFile) return;

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
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to analyze PDF.");
        setLoading(false);
      });
  }, [pdfFile]);

  return (
    <div className="rent-lease-analysis-card">
      <h3>Rent Lease Analysis</h3>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        disabled={!!pdfFile || loading}
        style={{ marginBottom: 12 }}
        ref={fileInputRef}
      />
      {pdfFile && (
        <div className="pdf-file-row">
          <span className="pdf-file-name">{pdfFile.name}</span>
          <button className="delete-pdf-btn" onClick={handleDelete} disabled={loading}>
            Delete
          </button>
        </div>
      )}
      {loading && (
        <div className="analysis-loading">
          <div className="spinner"></div>
          <span>Analyzing PDF...</span>
        </div>
      )}
      {error && <div className="analysis-error">{error}</div>}
      {analysis && (
        <div className="analysis-result-box">
          <div className="analysis-section">
            <div className="analysis-header">
              <div className="analysis-label">Summary:</div>
              <button
                className="copy-btn"
                onClick={() => handleCopy(analysis.summary, 'summary')}
                title="Copy to clipboard"
              >
                {copiedSummary ? "Copied!" : "Copy"}
              </button>
            </div>
            <textarea
              className="analysis-textbox"
              value={analysis.summary || ''}
              readOnly
              rows={8}
            />
          </div>
          <div className="analysis-section">
            <div className="analysis-header">
              <div className="analysis-label">Potential Issues:</div>
              <button
                className="copy-btn"
                onClick={() => handleCopy(analysis.issues, 'issues')}
                title="Copy to clipboard"
              >
                {copiedIssues ? "Copied!" : "Copy"}
              </button>
            </div>
            <textarea
              className="analysis-textbox"
              value={analysis.issues || ''}
              readOnly
              rows={8}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const [showProfile, setShowProfile] = useState(false);
  const [username, setUsername] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [currentFilters, setCurrentFilters] = useState(null);

  useEffect(() => {
    if (loggedIn) {
      fetch(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
        .then((res) => res.json())
        .then((data) => setUsername(data.username || ""))
        .catch(() => setUsername(""));
    }
  }, [loggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("token");
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

  // 如果正在显示搜索结果
  if (searchResults) {
    return (
      <div>
        <nav className="navbar">
          <div className="navbar-title">Elegantrix</div>
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
        <div className="navbar-title">Elegantrix</div>
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
          <div className="home-content-row">
            <div className="left-sidebar">
              <RentLeaseAnalysis />
            </div>
            <div className="home-content">
              <h1 className="welcome-title">Welcome back to Elegantrix!</h1>
              <p className="welcome-desc">
                Find your perfect home with AI-powered recommendations.
              </p>
              <AdvancedFilters onSearch={handleSearch} initialFilters={currentFilters} />
              <div className="home-illustration">
                <span role="img" aria-label="home" style={{ fontSize: 60 }}>🏡</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;