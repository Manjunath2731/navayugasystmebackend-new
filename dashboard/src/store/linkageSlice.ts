import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { getApiUrl, API_ENDPOINTS } from './config';

export interface Linkage {
  id: string;
  name: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLinkageInput {
  name: string;
  amount: number;
}

export interface UpdateLinkageInput {
  name?: string;
  amount?: number;
}

export interface LinkageState {
  linkages: Linkage[];
  selectedLinkage: Linkage | null;
  loading: boolean;
  error: string | null;
}

const initialState: LinkageState = {
  linkages: [],
  selectedLinkage: null,
  loading: false,
  error: null,
};

const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const fetchLinkages = createAsyncThunk(
  'linkage/fetchLinkages',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(getApiUrl(API_ENDPOINTS.LINKAGES), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch linkages');
      }

      const result = await response.json();
      return result.data.linkages;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const createLinkage = createAsyncThunk(
  'linkage/createLinkage',
  async (data: CreateLinkageInput, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(getApiUrl(API_ENDPOINTS.LINKAGES), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to create linkage');
      }

      const result = await response.json();
      return result.data.linkage;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const updateLinkage = createAsyncThunk(
  'linkage/updateLinkage',
  async ({ id, data }: { id: string; data: UpdateLinkageInput }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(getApiUrl(`${API_ENDPOINTS.LINKAGES}/${id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to update linkage');
      }

      const result = await response.json();
      return result.data.linkage;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const deleteLinkage = createAsyncThunk(
  'linkage/deleteLinkage',
  async (id: string, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(getApiUrl(`${API_ENDPOINTS.LINKAGES}/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to delete linkage');
      }

      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const linkageSlice = createSlice({
  name: 'linkage',
  initialState,
  reducers: {
    setSelectedLinkage: (state, action: PayloadAction<Linkage | null>) => {
      state.selectedLinkage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLinkages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLinkages.fulfilled, (state, action) => {
        state.loading = false;
        state.linkages = action.payload;
      })
      .addCase(fetchLinkages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createLinkage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLinkage.fulfilled, (state, action) => {
        state.loading = false;
        state.linkages.push(action.payload);
      })
      .addCase(createLinkage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateLinkage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLinkage.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.linkages.findIndex(l => l.id === action.payload.id);
        if (index !== -1) {
          state.linkages[index] = action.payload;
        }
      })
      .addCase(updateLinkage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteLinkage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLinkage.fulfilled, (state, action) => {
        state.loading = false;
        state.linkages = state.linkages.filter(l => l.id !== action.payload);
      })
      .addCase(deleteLinkage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedLinkage, clearError } = linkageSlice.actions;
export default linkageSlice.reducer;

