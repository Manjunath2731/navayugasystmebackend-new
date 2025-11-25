import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { getApiUrl, API_ENDPOINTS } from './config';

export interface SHG {
  id: string;
  shgNumber: string;
  shgName: string;
  shgAddress: string;
  savingAccountNumber: string;
  loanAccountNumber: string;
  loanSanctionDate: string;
  repaymentDate: string;
  fieldOfficerId: string;
  fieldOfficer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  branch: string;
  loanSanctionAmount: number;
  numberOfMonths: number;
  monthlyRepaymentAmount: number;
  fixedDeposit: number;
  linkageId: string;
  linkage?: {
    id: string;
    name: string;
    amount: number;
  };
  numberOfMembers: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSHGInput {
  shgName: string;
  shgAddress: string;
  savingAccountNumber: string;
  loanAccountNumber: string;
  loanSanctionDate: string;
  repaymentDate: string;
  fieldOfficerId: string;
  branch: string;
  loanSanctionAmount: number;
  numberOfMonths: number;
  monthlyRepaymentAmount: number;
  fixedDeposit: number;
  linkageId: string;
  numberOfMembers: number;
}

export interface UpdateSHGInput {
  shgName?: string;
  shgAddress?: string;
  savingAccountNumber?: string;
  loanAccountNumber?: string;
  loanSanctionDate?: string;
  repaymentDate?: string;
  fieldOfficerId?: string;
  branch?: string;
  loanSanctionAmount?: number;
  numberOfMonths?: number;
  monthlyRepaymentAmount?: number;
  fixedDeposit?: number;
  linkageId?: string;
  numberOfMembers?: number;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SHGState {
  shgs: SHG[];
  selectedSHG: SHG | null;
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
}

const initialState: SHGState = {
  shgs: [],
  selectedSHG: null,
  loading: false,
  error: null,
  pagination: null,
};

const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const fetchSHGs = createAsyncThunk(
  'shg/fetchSHGs',
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(getApiUrl(`${API_ENDPOINTS.SHGS}?page=${page}&limit=${limit}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch SHGs');
      }

      const result = await response.json();
      return {
        shgs: result.data.shgs,
        pagination: result.data.pagination,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const createSHG = createAsyncThunk(
  'shg/createSHG',
  async (data: CreateSHGInput, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(getApiUrl(API_ENDPOINTS.SHGS), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to create SHG');
      }

      const result = await response.json();
      return result.data.shg;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const updateSHG = createAsyncThunk(
  'shg/updateSHG',
  async ({ id, data }: { id: string; data: UpdateSHGInput }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(getApiUrl(`${API_ENDPOINTS.SHGS}/${id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to update SHG');
      }

      const result = await response.json();
      return result.data.shg;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const deleteSHG = createAsyncThunk(
  'shg/deleteSHG',
  async (id: string, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(getApiUrl(`${API_ENDPOINTS.SHGS}/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to delete SHG');
      }

      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const shgSlice = createSlice({
  name: 'shg',
  initialState,
  reducers: {
    setSelectedSHG: (state, action: PayloadAction<SHG | null>) => {
      state.selectedSHG = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSHGs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSHGs.fulfilled, (state, action) => {
        state.loading = false;
        state.shgs = action.payload.shgs;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchSHGs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createSHG.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSHG.fulfilled, (state, action) => {
        state.loading = false;
        state.shgs.push(action.payload);
        // Update pagination total if available
        if (state.pagination) {
          state.pagination.total += 1;
        }
      })
      .addCase(createSHG.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateSHG.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSHG.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.shgs.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.shgs[index] = action.payload;
        }
      })
      .addCase(updateSHG.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteSHG.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSHG.fulfilled, (state, action) => {
        state.loading = false;
        state.shgs = state.shgs.filter(s => s.id !== action.payload);
        // Update pagination total if available
        if (state.pagination) {
          state.pagination.total = Math.max(0, state.pagination.total - 1);
        }
      })
      .addCase(deleteSHG.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedSHG, clearError } = shgSlice.actions;
export default shgSlice.reducer;

