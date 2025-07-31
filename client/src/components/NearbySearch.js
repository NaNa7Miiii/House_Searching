import React, { useState } from 'react';
import './NearbySearch.css';

const API_BASE = "http://localhost:3001/api";

function NearbySearch() {
  const [address, setAddress] = useState('');
  const [radius, setRadius] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!address.trim()) {
      setError('Please enter an address');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch(`${API_BASE}/nearby-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: address.trim(),
          radius: parseInt(radius)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setAddress('');
    setRadius(1000);
    setError('');
    setResults(null);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Hospitals & Medical Centers': '🏥',
      'Restaurants & Cafes': '🍽️',
      'Transportation Hubs': '🚇',
      'Schools & Universities': '🎓',
      'Shopping Centers': '🛍️',
      'Parks & Recreation': '🌳',
      'Banks & ATMs': '🏦',
      'Pharmacies': '💊'
    };
    return icons[category] || '📍';
  };

  return (
    <div className="nearby-search-card">
      <h3>Nearby Search</h3>

      <form onSubmit={handleSearch} className="nearby-search-form">
        <div className="form-group">
          <label htmlFor="address">Address:</label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter an address (e.g., Times Square, New York)"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="radius">Search Radius (meters):</label>
          <select
            id="radius"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            disabled={loading}
          >
            <option value={500}>500m</option>
            <option value={1000}>1km</option>
            <option value={2000}>2km</option>
            <option value={5000}>5km</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="search-btn">
            {loading ? 'Searching...' : 'Search Nearby'}
          </button>
          <button type="button" onClick={handleClear} className="clear-btn">
            Clear
          </button>
        </div>
      </form>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <span>Searching for nearby places...</span>
        </div>
      )}

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {results && (
        <div className="results">
          <div className="location-info">
            <h4>📍 {results.location.formattedAddress}</h4>
            <p>Lat: {results.location.lat.toFixed(6)}, Lng: {results.location.lng.toFixed(6)}</p>
          </div>

          <div className="categories">
            {Object.entries(results.nearbyPlaces).map(([category, places]) => (
              <div key={category} className="category">
                <h5>
                  {getCategoryIcon(category)} {category}
                  <span className="count">({places.length})</span>
                </h5>

                {places.length > 0 ? (
                  <div className="places-list">
                    {places.map((place, index) => (
                      <div key={index} className="place-item">
                        <div className="place-name">{place.name}</div>
                        <div className="place-address">{place.address}</div>
                        {place.rating && (
                          <div className="place-rating">
                            ⭐ {place.rating.toFixed(1)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-results">No places found in this category</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NearbySearch;