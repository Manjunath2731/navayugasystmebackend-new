import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiUrl, API_ENDPOINTS } from './config';

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface SettingsState {
  loading: boolean;
  error: string | null;
  success: string | null;
}

const initialState: SettingsState = {
  loading: false,
  error: null,
  success: null,
};

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Async thunk for updating profile
export const updateProfile = createAsyncThunk(
  'settings/updateProfile',
  async (data: UpdateProfileInput, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(getApiUrl(API_ENDPOINTS.SETTINGS.PROFILE), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to update profile');
      }

      const result = await response.json();
      return result.data.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Async thunk for changing password
export const changePassword = createAsyncThunk(
  'settings/changePassword',
  async (data: ChangePasswordInput, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(getApiUrl(API_ENDPOINTS.SETTINGS.PASSWORD), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to change password');
      }

      const result = await response.json();
      return result.message;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Async thunk for uploading avatar
export const uploadAvatar = createAsyncThunk(
  'settings/uploadAvatar',
  async (file: File, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(getApiUrl(API_ENDPOINTS.SETTINGS.AVATAR), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to upload avatar');
      }

      const result = await response.json();
      return result.data.avatarUrl;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Async thunk for deleting avatar
export const deleteAvatar = createAsyncThunk(
  'settings/deleteAvatar',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(getApiUrl(API_ENDPOINTS.SETTINGS.AVATAR), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to delete avatar');
      }

      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    // Update profile
    builder.addCase(updateProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = null;
    });
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.success = 'Profile updated successfully';
      // Update auth user state with new profile data
      if (action.payload) {
        // Dispatch setUser to update auth state
        // This will be handled by the component calling fetchProfile
      }
    });
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to update profile';
    });

    // Change password
    builder.addCase(changePassword.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = null;
    });
    builder.addCase(changePassword.fulfilled, (state, action) => {
      state.loading = false;
      state.success = action.payload as string;
    });
    builder.addCase(changePassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to change password';
    });

    // Upload avatar
    builder.addCase(uploadAvatar.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = null;
    });
    builder.addCase(uploadAvatar.fulfilled, (state) => {
      state.loading = false;
      state.success = 'Avatar uploaded successfully';
      // User profile will be refreshed in component
    });
    builder.addCase(uploadAvatar.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to upload avatar';
    });

    // Delete avatar
    builder.addCase(deleteAvatar.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = null;
    });
    builder.addCase(deleteAvatar.fulfilled, (state) => {
      state.loading = false;
      state.success = 'Avatar deleted successfully';
    });
    builder.addCase(deleteAvatar.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to delete avatar';
    });
  },
});

export const { clearError, clearSuccess } = settingsSlice.actions;
export default settingsSlice.reducer;

