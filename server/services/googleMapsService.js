const { Client } = require('@googlemaps/google-maps-services-js');

class GoogleMapsService {
  constructor() {
    this.client = new Client({});
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!this.apiKey) {
      console.warn('Warning: GOOGLE_MAPS_API_KEY not found in environment variables');
    }
  }

  // Convert address to coordinates using Geocoding API
  async geocodeAddress(address) {
    try {
      if (!this.apiKey) {
        throw new Error('Google Maps API key is required');
      }

      const cleanedAddress = this.cleanAddress(address);

      const response = await this.client.geocode({
        params: {
          address: cleanedAddress,
          key: this.apiKey
        }
      });

      if (response.data.results.length === 0) {
        throw new Error('Address not found');
      }

      const location = response.data.results[0].geometry.location;
      const result = response.data.results[0];

      return {
        lat: location.lat,
        lng: location.lng,
        formattedAddress: result.formatted_address,
        originalAddress: address,
        cleanedAddress: cleanedAddress,
        confidence: result.geometry.location_type || 'unknown'
      };
    } catch (error) {
      console.error('Geocoding error:', error.message);
      throw error;
    }
  }

  // Clean and standardize address format
  cleanAddress(address) {
    return address
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[,\s]+/g, ', ')
      .replace(/,\s*,/g, ',')
      .replace(/^,+|,+$/g, '');
  }

  // Search for nearby places using Places API
  async searchNearbyPlaces(lat, lng, radius = 1000, type = null) {
    try {
      if (!this.apiKey) {
        throw new Error('Google Maps API key is required');
      }

      const response = await this.client.placesNearby({
        params: {
          location: { lat, lng },
          radius: radius,
          type: type,
          key: this.apiKey
        }
      });

      return response.data.results.map(place => ({
        name: place.name,
        address: place.vicinity,
        rating: place.rating,
        types: place.types,
        placeId: place.place_id,
        photos: place.photos ? place.photos.slice(0, 3) : []
      }));
    } catch (error) {
      console.error('Nearby search error:', error.message);
      throw error;
    }
  }

  // Search for multiple types of places
  async searchMultipleTypes(lat, lng, radius = 1000, selectedTypes = null) {
    let placeTypes = [];

    if (selectedTypes && selectedTypes.length > 0) {
      placeTypes = selectedTypes.map(type => ({
        type: type,
        name: this.formatTypeName(type)
      }));
    } else {
      placeTypes = [
        { type: 'hospital', name: 'Hospitals & Medical Centers' },
        { type: 'restaurant', name: 'Restaurants & Cafes' },
        { type: 'transit_station', name: 'Transportation Hubs' },
        { type: 'school', name: 'Schools & Universities' },
        { type: 'shopping_mall', name: 'Shopping Centers' },
        { type: 'park', name: 'Parks & Recreation' },
        { type: 'bank', name: 'Banks & ATMs' },
        { type: 'pharmacy', name: 'Pharmacies' }
      ];
    }

    const results = {};

    for (const placeType of placeTypes) {
      try {
        const places = await this.searchNearbyPlaces(lat, lng, radius, placeType.type);
        if (places && places.length > 0) {
          const placesWithType = places.map(place => ({
            ...place,
            category: placeType.name,
            type: placeType.type
          }));
          results[placeType.name] = placesWithType.slice(0, 5); // Limit to 5 results per category
        }
      } catch (error) {
        console.error(`Error searching for ${placeType.name}:`, error.message);
      }
    }

    return results;
  }

  // Helper method to format type names
  formatTypeName(type) {
    return type.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  // Get place details for more information
  async getPlaceDetails(placeId) {
    try {
      if (!this.apiKey) {
        throw new Error('Google Maps API key is required');
      }

      const response = await this.client.placeDetails({
        params: {
          place_id: placeId,
          fields: ['name', 'formatted_address', 'formatted_phone_number', 'website', 'opening_hours', 'rating', 'reviews'],
          key: this.apiKey
        }
      });

      return response.data.result;
    } catch (error) {
      console.error('Place details error:', error.message);
      throw error;
    }
  }
}

module.exports = new GoogleMapsService();