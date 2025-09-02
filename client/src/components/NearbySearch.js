import React, { useState, useEffect, useRef } from 'react';
import './NearbySearch.css';

const API_BASE = "http://localhost:3001/api";

// localStorage keys for nearby search
const NEARBY_STORAGE_KEYS = {
  ADDRESS: 'homequest_nearby_address',
  RADIUS: 'homequest_nearby_radius',
  RESULTS: 'homequest_nearby_results',
  SELECTED_TYPES: 'homequest_nearby_types'
};

// All available place types
const ALL_PLACE_TYPES = [
  'accounting', 'airport', 'amusement_park', 'aquarium', 'art_gallery', 'atm',
  'bakery', 'bank', 'bar', 'beauty_salon', 'bicycle_store', 'book_store',
  'bowling_alley', 'bus_station', 'cafe', 'campground', 'car_dealer',
  'car_rental', 'car_repair', 'car_wash', 'cemetery', 'church', 'city_hall',
  'clothing_store', 'convenience_store', 'courthouse', 'dentist', 'department_store',
  'doctor', 'drugstore', 'electrician', 'electronics_store', 'embassy',
  'fire_station', 'florist', 'funeral_home', 'furniture_store', 'gas_station',
  'gym', 'hair_care', 'hardware_store', 'hindu_temple', 'home_goods_store',
  'hospital', 'insurance_agency', 'jewelry_store', 'laundry', 'lawyer',
  'library', 'light_rail_station', 'liquor_store', 'local_government_office',
  'locksmith', 'lodging', 'meal_delivery', 'meal_takeaway', 'mosque',
  'movie_rental', 'movie_theater', 'moving_company', 'museum', 'night_club',
  'painter', 'park', 'parking', 'pet_store', 'pharmacy', 'physiotherapist',
  'plumber', 'police', 'post_office', 'primary_school', 'real_estate_agency',
  'restaurant', 'roofing_contractor', 'rv_park', 'school', 'secondary_school',
  'shoe_store', 'shopping_mall', 'spa', 'stadium', 'storage', 'subway_station',
  'supermarket', 'synagogue', 'taxi_stand', 'tourist_attraction', 'train_station',
  'transit_station', 'travel_agency', 'university', 'veterinary_care', 'zoo'
];

function NearbySearch() {
  const [address, setAddress] = useState('');
  const [radius, setRadius] = useState(3000); // Default to 3km
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [filteredTypes, setFilteredTypes] = useState([]);
  const searchRef = useRef(null);

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedAddress = localStorage.getItem(NEARBY_STORAGE_KEYS.ADDRESS);
    const savedRadius = localStorage.getItem(NEARBY_STORAGE_KEYS.RADIUS);
    const savedResults = localStorage.getItem(NEARBY_STORAGE_KEYS.RESULTS);
    const savedTypes = localStorage.getItem(NEARBY_STORAGE_KEYS.SELECTED_TYPES);

    if (savedAddress) {
      setAddress(savedAddress);
    }

    if (savedRadius) {
      setRadius(parseInt(savedRadius));
    }

    if (savedResults) {
      try {
        setResults(JSON.parse(savedResults));
      } catch (e) {
        console.error('Failed to parse saved nearby results:', e);
      }
    }

    if (savedTypes) {
      try {
        setSelectedTypes(JSON.parse(savedTypes));
      } catch (e) {
        console.error('Failed to parse saved types:', e);
      }
    }
  }, []);

  // Save address to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(NEARBY_STORAGE_KEYS.ADDRESS, address);
  }, [address]);

  // Save radius to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(NEARBY_STORAGE_KEYS.RADIUS, radius.toString());
  }, [radius]);

  // Save results to localStorage whenever they change
  useEffect(() => {
    if (results) {
      localStorage.setItem(NEARBY_STORAGE_KEYS.RESULTS, JSON.stringify(results));
    } else {
      localStorage.removeItem(NEARBY_STORAGE_KEYS.RESULTS);
    }
  }, [results]);

  // Save selected types to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(NEARBY_STORAGE_KEYS.SELECTED_TYPES, JSON.stringify(selectedTypes));
  }, [selectedTypes]);

  // Filter types based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTypes(ALL_PLACE_TYPES.filter(type => !selectedTypes.includes(type)));
    } else {
      const filtered = ALL_PLACE_TYPES.filter(type =>
        !selectedTypes.includes(type) &&
        type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTypes(filtered);
    }
  }, [searchTerm, selectedTypes]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowTypeDropdown(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
      // 首先进行地址解析，让用户确认
      const geocodeResponse = await fetch(`${API_BASE}/geocode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: address.trim()
        }),
      });

      const geocodeData = await geocodeResponse.json();

      if (!geocodeResponse.ok) {
        throw new Error(geocodeData.error || 'Address geocoding failed');
      }

      // 显示地址解析结果，让用户确认
      const confirmed = window.confirm(
        `Google Maps resolved your address to:\n\n` +
        `📍 ${geocodeData.formattedAddress}\n` +
        `Lat: ${geocodeData.lat.toFixed(6)}\n` +
        `Lng: ${geocodeData.lng.toFixed(6)}\n\n` +
        `Is this the correct location? Click OK to continue searching nearby places.`
      );

      if (!confirmed) {
        setLoading(false);
        return;
      }

      // 用户确认后，搜索附近地点
      const response = await fetch(`${API_BASE}/nearby-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: address.trim(),
          radius: parseInt(radius),
          types: selectedTypes.length > 0 ? selectedTypes : undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data);
    } catch (err) {
      console.error('Nearby search error:', err);
      if (err.message && err.message.includes('Rate limited')) {
        setError("Service temporarily unavailable due to high demand. Please try again in a few minutes.");
      } else {
        setError(err.message || "Search failed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setAddress('');
    setRadius(3000);
    setError('');
    setResults(null);
    setSelectedTypes([]);
    setSearchTerm('');
    setShowTypeDropdown(false);
    // Clear localStorage
    localStorage.removeItem(NEARBY_STORAGE_KEYS.ADDRESS);
    localStorage.removeItem(NEARBY_STORAGE_KEYS.RADIUS);
    localStorage.removeItem(NEARBY_STORAGE_KEYS.RESULTS);
    localStorage.removeItem(NEARBY_STORAGE_KEYS.SELECTED_TYPES);
  };

  const addType = (type) => {
    if (!selectedTypes.includes(type)) {
      setSelectedTypes([...selectedTypes, type]);
    }
    setSearchTerm('');
    setShowTypeDropdown(false);
  };

  const removeType = (typeToRemove) => {
    setSelectedTypes(selectedTypes.filter(type => type !== typeToRemove));
  };

  const formatTypeName = (type) => {
    return type.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="nearby-search-content">
      {/* Feature Description */}
      <div className="feature-description">
        <div className="feature-title">Nearby Places Search</div>
        <div className="feature-content">
          <div className="feature-item">
            <div className="feature-item-title">Location-Based Discovery</div>
            <div className="feature-item-desc">
              Find nearby places and services around any address with customizable search radius and filters.
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-item-title">Advanced Filtering</div>
            <div className="feature-item-desc">
              Filter results by place types including restaurants, shops, services, and attractions.
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-item-title">Comprehensive Results</div>
            <div className="feature-item-desc">
              Get detailed information about nearby places including ratings, addresses, and contact details.
            </div>
          </div>
        </div>
      </div>

      <div className="nearby-main-content">
        {/* Left Column - Search Form */}
        <div className="nearby-form-section">
          <div className="nearby-form-card">
            <div className="nearby-form-header">
              <h3>Search Nearby Places</h3>
              <div className="nearby-form-subtitle">
                Enter an address and discover places around it
              </div>
            </div>

            <form onSubmit={handleSearch} className="nearby-form">
              <div className="form-section">
                <div className="section-title">Location</div>
                <div className="form-group">
                  <input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter an address (e.g., Times Square, New York)"
                    disabled={loading}
                  />
                  <div className="address-tip">
                    💡 <strong>Tip:</strong> Use standard address format: Street, City, Province, Postal Code
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-title">Search Radius</div>
                <div className="form-group">
                  <select
                    id="radius"
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    disabled={loading}
                  >
                    <option value={500}>500m</option>
                    <option value={1000}>1km</option>
                    <option value={2000}>2km</option>
                    <option value={3000}>3km</option>
                    <option value={5000}>5km</option>
                    <option value={10000}>10km</option>
                  </select>
                </div>
              </div>

              <div className="form-section">
                <div className="section-title">Filter by Place Type</div>
                <div className="form-group">
                  <div className="type-search-container" ref={searchRef}>
                    <div className="type-search-input">
                      <input
                        type="text"
                        placeholder="Search for place types..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setShowTypeDropdown(true)}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="type-dropdown-toggle"
                        onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                        disabled={loading}
                      >
                        ▼
                      </button>
                    </div>

                    {showTypeDropdown && (
                      <div className="type-dropdown">
                        {filteredTypes.length > 0 ? (
                          filteredTypes.slice(0, 10).map((type) => (
                            <div
                              key={type}
                              className="type-option"
                              onClick={() => addType(type)}
                            >
                              {formatTypeName(type)}
                            </div>
                          ))
                        ) : (
                          <div className="type-option no-results">
                            No types found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Types Display */}
                {selectedTypes.length > 0 && (
                  <div className="selected-types">
                    <div className="type-chips">
                      {selectedTypes.map((type) => (
                        <div key={type} className="type-chip">
                          <span className="type-chip-text">{formatTypeName(type)}</span>
                          <button
                            type="button"
                            className="type-chip-remove"
                            onClick={() => removeType(type)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="form-actions">
                {/* 显示当前选择的类型 */}
                {selectedTypes.length > 0 && (
                  <div className="selected-types-summary">
                    <div className="summary-text">
                      Will search for: <strong>{selectedTypes.length}</strong> type{selectedTypes.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                )}

                <button type="submit" className="search-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <span className="search-icon">🔍</span>
                      Search Nearby
                    </>
                  )}
                </button>
                <button type="button" onClick={handleClear} className="clear-btn">
                  Clear All
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column - Results Only */}
        <div className="nearby-sidebar">
          {/* Results */}
          {loading && (
            <div className="sidebar-card">
              <div className="loading-card">
                <div className="spinner"></div>
                <span>Searching for nearby places...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="sidebar-card">
              <div className="error-card">
                <div className="error-icon">⚠️</div>
                <div className="error-message">{error}</div>
              </div>
            </div>
          )}

          {results && (
            <div className="sidebar-card">
              <div className="sidebar-card-header">
                <h4>Search Results</h4>
                <div className="results-count">
                  {Object.values(results.nearbyPlaces || {}).flat().length} places found
                </div>
              </div>
              <div className="results-summary">
                <div className="location-info">
                  <div className="location-address">📍 {results.location.formattedAddress}</div>
                  <div className="location-coords">
                    Lat: {results.location.lat.toFixed(6)}, Lng: {results.location.lng.toFixed(6)}
                  </div>
                </div>
                {/* 添加类别统计信息 */}
                <div className="category-stats">
                  <div className="stats-title">Categories found:</div>
                  {Object.entries(results.nearbyPlaces || {}).map(([category, places]) => (
                    <div key={category} className="category-stat">
                      {formatTypeName(category)}: {places.length} places
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Results Display */}
      {results && (
        <div className="results-section">
          <div className="results-container">
            {Object.entries(results.nearbyPlaces || {}).map(([category, places]) => (
              <div key={category} className="category-section">
                <h3 className="category-title">{formatTypeName(category)}</h3>
                <div className="places-grid">
                  {places.map((place, index) => (
                    <div key={index} className="place-card">
                      <div className="place-header">
                        <div className="place-name">{place.name}</div>
                        {place.rating && (
                          <div className="place-rating">
                            ⭐ {place.rating.toFixed(1)}
                          </div>
                        )}
                      </div>
                      <div className="place-address">{place.address}</div>
                      {/* 添加类型信息 */}
                      <div className="place-type">
                        <span className="type-badge">{place.type || place.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NearbySearch;