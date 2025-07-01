import axios from 'axios';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '../authConfig';

// Initialize MSAL outside of component
const msalInstance = new PublicClientApplication(msalConfig);

// Create an axios instance
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  const accounts = msalInstance.getAllAccounts();
  
  if (accounts.length > 0) {
    try {
      // Get token silently
      const response = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0]
      });
      
      // Add bearer token to request
      config.headers.Authorization = `Bearer ${response.accessToken}`;
    } catch (error) {
      console.error('Error acquiring token:', error);
      
      // If silent token acquisition fails, try interactive
      if (error.name === 'InteractionRequiredAuthError') {
        try {
          const response = await msalInstance.acquireTokenPopup(loginRequest);
          config.headers.Authorization = `Bearer ${response.accessToken}`;
        } catch (err) {
          console.error('Failed to acquire token interactively:', err);
        }
      }
    }
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Function to get current authenticated user
export const getCurrentUser = async () => {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) {
    return null;
  }
  
  try {
    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: accounts[0]
    });
    
    return {
      account: accounts[0],
      accessToken: response.accessToken
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export default apiClient; 