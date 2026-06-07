/**
 * API Service for Dehradun Estates
 * Handles all communication with the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Helper to make authenticated requests
const request = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
export const authApi = {
  // Google OAuth login/register
  googleAuth: async (userData) => {
    return request('/auth/google', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  // Verify current token
  verifyToken: async () => {
    return request('/auth/verify');
  },

  // Get current user profile
  getProfile: async () => {
    return request('/auth/me');
  }
};

// Listings API
export const listingsApi = {
  // Get all listings with filters
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/listings${queryString ? `?${queryString}` : ''}`);
  },

  // Get single listing by ID
  getById: async (id) => {
    return request(`/listings/${id}`);
  },

  // Create new listing
  create: async (listingData) => {
    return request('/listings', {
      method: 'POST',
      body: JSON.stringify(listingData)
    });
  },

  // Update listing
  update: async (id, listingData) => {
    return request(`/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(listingData)
    });
  },

  // Delete listing
  delete: async (id) => {
    return request(`/listings/${id}`, {
      method: 'DELETE'
    });
  },

  // Get user's own listings
  getMyListings: async () => {
    return request('/listings/user/my-listings');
  }
};

// Inquiries API
export const inquiriesApi = {
  // Create new inquiry
  create: async (inquiryData) => {
    return request('/inquiries', {
      method: 'POST',
      body: JSON.stringify(inquiryData)
    });
  },

  // Get inquiries for user's listings
  getMyListingsInquiries: async () => {
    return request('/inquiries/my-listings');
  },

  // Get single inquiry
  getById: async (id) => {
    return request(`/inquiries/${id}`);
  },

  // Delete inquiry
  delete: async (id) => {
    return request(`/inquiries/${id}`, {
      method: 'DELETE'
    });
  }
};

// Chats API
export const chatsApi = {
  // Get all chats for current user
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/chats${queryString ? `?${queryString}` : ''}`);
  },

  // Create new chat
  create: async (chatData) => {
    return request('/chats', {
      method: 'POST',
      body: JSON.stringify(chatData)
    });
  },

  // Get chat details
  getById: async (chatId) => {
    return request(`/chats/${chatId}`);
  },

  // Get messages for a chat
  getMessages: async (chatId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/chats/${chatId}/messages${queryString ? `?${queryString}` : ''}`);
  },

  // Send message
  sendMessage: async (chatId, text) => {
    return request(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  }
};

// Reports API
export const reportsApi = {
  // Create new report
  create: async (reportData) => {
    return request('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData)
    });
  },

  // Get reports for user's listings
  getMyListingsReports: async () => {
    return request('/reports/my-listings');
  }
};

// Upload API
export const uploadApi = {
  // Upload multiple images
  uploadImages: async (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const token = getAuthToken();
    
    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      return data;
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  },

  // Upload single image
  uploadSingle: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const token = getAuthToken();
    
    try {
      const response = await fetch(`${API_BASE_URL}/upload/single`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      return data;
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  },

  // Delete uploaded file
  deleteFile: async (filename) => {
    return request(`/upload/${filename}`, {
      method: 'DELETE'
    });
  }
};

export default {
  auth: authApi,
  listings: listingsApi,
  inquiries: inquiriesApi,
  chats: chatsApi,
  reports: reportsApi,
  upload: uploadApi
};