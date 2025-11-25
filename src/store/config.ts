/**
 * API Configuration
 * 
 * Centralized configuration for API endpoints.
 * Change the base URL here to update it across all API calls.
 * 
 * Environment Variable: VITE_API_URL
 * Fallback: http://localhost:3000
 */

/**
 * Base URL for the API server
 * 
 * Priority:
 * 1. VITE_API_URL environment variable (if set)
 * 2. Fallback to http://localhost:3000
 * 
 * To change the API URL:
 * - For development: Set VITE_API_URL in .env file
 * - For production: Set VITE_API_URL in build environment
 * - Or modify the fallback value below
 */
export const API_BASE_URL: string = 
  import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * API endpoint paths
 * Centralized endpoint paths for consistency
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/auth/profile',
  },
  
  // Users/Employees
  USERS: '/api/users',
  
  // SHGs
  SHGS: '/api/shgs',
  
  // SHG Members
  SHG_MEMBERS: '/api/shg-members',
  
  // Linkages
  LINKAGES: '/api/linkages',
  
  // Monthly Repayments
  MONTHLY_REPAYMENTS: '/api/monthly-repayments',
  
  // Repayment Analytics
  REPAYMENT_ANALYTICS: '/api/repayment-analytics',
  
  // Delete Tickets
  DELETE_TICKETS: '/api/delete-tickets',
  
  // Settings
  SETTINGS: {
    PROFILE: '/api/settings/profile',
    PASSWORD: '/api/settings/password',
    AVATAR: '/api/settings/avatar',
  },
  
  // Files
  FILES: {
    UPLOAD: '/api/files/upload',
  },
} as const;

/**
 * Helper function to build full API URL
 * @param endpoint - API endpoint path
 * @returns Full URL string
 */
export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

