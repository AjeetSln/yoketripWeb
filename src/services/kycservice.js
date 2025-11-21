import axios from 'axios';

const baseUrl = 'https://yoketrip.in';

const KYCService = {
  async getToken() {
    return localStorage.getItem('auth_token');
  },

  async checkKYCStatus() {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${baseUrl}/api/kyc/checkstatus`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        return response.data;
      } else if (response.status === 404) {
        // User has not submitted KYC
        return {
          success: false,
          status: 'not_submitted',
        };
      } else {
        throw new Error(`Failed to check KYC status: ${response.status}`);
      }
    } catch (e) {
      console.error('Error checking KYC status:', e);
      throw e;
    }
  },

  async getUserSubscriptionPlan() {
    try {
      const token = await this.getToken();
      if (!token) {
        return 'Free';
      }

      const response = await axios.get(`${baseUrl}/api/users/subscription`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        return response.data.data?.plan || 'Free';
      } else {
        return 'Free';
      }
    } catch (e) {
      console.error('Error fetching user subscription plan:', e);
      return 'Free';
    }
  },
};

export default KYCService;