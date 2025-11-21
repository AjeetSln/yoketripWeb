const BASE_URL = 'https://yoketrip.in';

class GuideServices {
  async getToken() {
    // Mock implementation; replace with actual secure storage
    return 'mock-token';
  }

  async saveGuideProfile({ guide, certificateFile, token }) {
    try {
      if (guide.isCertified && !certificateFile) {
        throw new Error('Certificate is required for certified guides');
      }

      const formData = new FormData();
      formData.append('workLocation', guide.workLocation);
      formData.append('price', guide.price.toString());
      formData.append('priceType', guide.priceType);
      formData.append('languages', JSON.stringify(guide.languages));
      formData.append('availability', JSON.stringify(guide.availability));
      formData.append('about', guide.about);
      formData.append('isCertified', guide.isCertified.toString());

      if (guide.isCertified && certificateFile) {
        formData.append('certificate', certificateFile);
      }

      const response = await fetch(`${BASE_URL}/api/guide/create`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (response.status === 201) {
        return Guide.fromMap(data.guide);
      } else {
        throw new Error(`Failed to save guide profile: ${data.message}`);
      }
    } catch (e) {
      console.error('Error in saveGuideProfile:', e);
      throw e;
    }
  }

  async getGuideProfile(userId, token) {
    try {
      const response = await fetch(`${BASE_URL}/api/guide/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const data = await response.json();
      if (response.status === 200) {
        return data ? Guide.fromMap(data) : null;
      } else if (response.status === 404) {
        return null;
      } else {
        throw new Error(`Failed to fetch guide profile: ${response.status}`);
      }
    } catch (e) {
      console.error('Error fetching guide profile:', e);
      throw e;
    }
  }

  async fetchBookings(token) {
    try {
      const response = await fetch(`${BASE_URL}/api/traveller/guide/my-bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.status === 200) {
        return { upcoming: data.upcoming || [], completed: data.completed || [] };
      } else {
        throw new Error(`Failed to fetch bookings: ${response.status}`);
      }
    } catch (e) {
      console.error('Error fetching bookings:', e);
      throw e;
    }
  }

  async deleteProfile(guideId, token) {
    try {
      const response = await fetch(`${BASE_URL}/api/guide/${guideId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.status === 200;
    } catch (e) {
      console.error('Error deleting profile:', e);
      return false;
    }
  }

  async toggleHideProfile(guideId, hide, token) {
    try {
      const response = await fetch(`${BASE_URL}/api/guide/${guideId}/hide`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ hide })
      });
      return response.status === 200;
    } catch (e) {
      console.error('Error toggling profile visibility:', e);
      return false;
    }
  }

  async cancelBooking(bookingId, token) {
    try {
      const response = await fetch(`${BASE_URL}/api/traveller/cancel-booking/${bookingId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.status === 200;
    } catch (e) {
      console.error('Error cancelling booking:', e);
      return false;
    }
  }

  async getLocationSuggestions(query) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`,
        { headers: { 'User-Agent': 'ReactApp' } }
      );
      const data = await response.json();
      return data.map(item => item.display_name);
    } catch (e) {
      console.error('Error fetching location suggestions:', e);
      return [];
    }
  }
}

const guideServices = new GuideServices();