// API utility function that automatically adds auth token to requests

/**
 * Make an authenticated API request
 * Automatically includes the auth token from localStorage
 */
export const apiRequest = async (url, options = {}) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
  
  // Get token from localStorage
  const token = localStorage.getItem('authToken');
  
  // Set up headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers, // Allow override of Content-Type for FormData, etc.
  };
  
  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Merge with existing options
  const requestOptions = {
    ...options,
    headers,
    credentials: 'include', // Still send cookies if available
  };
  
  // Remove Content-Type if body is FormData (browser will set it automatically with boundary)
  if (options.body instanceof FormData) {
    delete requestOptions.headers['Content-Type'];
  }
  
  return fetch(fullUrl, requestOptions);
};





