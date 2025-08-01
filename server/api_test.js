const axios = require('axios');

const API_KEY = 'AIzaSyC36dT8n4JMhg1ocShFGUSFBh4FPEfenLg';
const address = '1 hack drive, menlo park, CA';

const params = {
  key: API_KEY,
  address: address
};

const baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';

axios.get(baseUrl, { params })
  .then(response => {
    const data = response.data;
    console.log(Object.keys(data)); // 打印所有返回的 key（调试用）

    if (data.status === 'OK') {
      const geometry = data.results[0].geometry;
      const lat = geometry.location.lat;
      const lon = geometry.location.lng;
      console.log(lat, lon);
    } else {
      console.log('Geocoding failed:', data.status, data.error_message);
    }
  })
  .catch(error => {
    console.error('Request error:', error);
  });
