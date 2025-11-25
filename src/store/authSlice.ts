import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { getApiUrl, API_ENDPOINTS } from './config';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  dashboards: string[];
  phone?: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

// Async thunk for login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.AUTH.LOGIN), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Login failed');
      }

      const data = await response.json();
      // Extract token and user from the nested data structure
      return {
        token: data.data.token,
        user: data.data.user
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Async thunk for fetching user profile
export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.token;
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      const response = await fetch(getApiUrl(API_ENDPOINTS.AUTH.PROFILE), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch profile');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Async thunk for logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.token;
      
      if (!token) {
        return null; // No token to logout with
      }
      
      const response = await fetch(getApiUrl(API_ENDPOINTS.AUTH.LOGOUT), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Logout failed');
      }

      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      // Persist token in localStorage
      localStorage.setItem('token', action.payload);
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      // Remove token from localStorage
      localStorage.removeItem('token');
    }
  },
  extraReducers: (builder) => {
    // Login pending
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    
    // Login fulfilled
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      // Persist token in localStorage
      localStorage.setItem('token', action.payload.token);
    });
    
    // Login rejected
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Login failed';
    });
    
    // Fetch profile pending
    builder.addCase(fetchProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    
    // Fetch profile fulfilled
    builder.addCase(fetchProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.data.user;
    });
    
    // Fetch profile rejected
    builder.addCase(fetchProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to fetch profile';
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      // Remove token from localStorage on auth failure
      localStorage.removeItem('token');
    });
    
    // Logout fulfilled
    builder.addCase(logout.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      // Remove token from localStorage on logout
      localStorage.removeItem('token');
    });
    
    // Logout rejected
    builder.addCase(logout.rejected, (state) => {
      // Even if logout fails on the server, we clear client state
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      // Remove token from localStorage even on logout failure
      localStorage.removeItem('token');
    });
  },
});

export const { clearError, setUser, setToken, clearAuth } = authSlice.actions;
export default authSlice.reducer;