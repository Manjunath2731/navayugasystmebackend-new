import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { getApiUrl, API_ENDPOINTS } from './config';

export type MemberRole = 'pratini1' | 'pratini2' | 'member';

export interface SHGMember {
  id: string;
  shgId: string;
  shg?: {
    id: string;
    shgName: string;
  };
  name: string;
  phoneNumber: string;
  role: MemberRole;
  aadharCardFront: string;
  aadharCardBack: string;
  panCard: string;
  voidIdCard: string;
  homeRentalAgreement?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSHGMemberInput {
  shgId: string;
  name: string;
  phoneNumber: string;
  role: MemberRole;
  aadharCardFront: string;
  aadharCardBack: string;
  panCard: string;
  voidIdCard: string;
  homeRentalAgreement?: string;
}

export interface UpdateSHGMemberInput {
  name?: string;
  phoneNumber?: string;
  role?: MemberRole;
  aadharCardFront?: string;
  aadharCardBack?: string;
  panCard?: string;
  voidIdCard?: string;
  homeRentalAgreement?: string;
}

export interface SHGMemberState {
  members: SHGMember[];
  selectedMember: SHGMember | null;
  loading: boolean;
  error: string | null;
}

const initialState: SHGMemberState = {
  members: [],
  selectedMember: null,
  loading: false,
  error: null,
};

const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const fetchSHGMembers = createAsyncThunk(
  'shgMember/fetchSHGMembers',
  async (shgId: string | undefined, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const url = shgId 
        ? getApiUrl(`${API_ENDPOINTS.SHG_MEMBERS}?shgId=${shgId}`)
        : getApiUrl(API_ENDPOINTS.SHG_MEMBERS);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch SHG members');
      }

      const result = await response.json();
      return result.data.members;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const createSHGMember = createAsyncThunk(
  'shgMember/createSHGMember',
  async (data: CreateSHGMemberInput, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(getApiUrl(API_ENDPOINTS.SHG_MEMBERS), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to create SHG member');
      }

      const result = await response.json();
      return result.data.member;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const updateSHGMember = createAsyncThunk(
  'shgMember/updateSHGMember',
  async ({ id, data }: { id: string; data: UpdateSHGMemberInput }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(getApiUrl(`${API_ENDPOINTS.SHG_MEMBERS}/${id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to update SHG member');
      }

      const result = await response.json();
      return result.data.member;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const deleteSHGMember = createAsyncThunk(
  'shgMember/deleteSHGMember',
  async (id: string, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(getApiUrl(`${API_ENDPOINTS.SHG_MEMBERS}/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to delete SHG member');
      }

      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const shgMemberSlice = createSlice({
  name: 'shgMember',
  initialState,
  reducers: {
    setSelectedMember: (state, action: PayloadAction<SHGMember | null>) => {
      state.selectedMember = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSHGMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSHGMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(fetchSHGMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createSHGMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSHGMember.fulfilled, (state, action) => {
        state.loading = false;
        state.members.push(action.payload);
      })
      .addCase(createSHGMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateSHGMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSHGMember.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.members.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.members[index] = action.payload;
        }
      })
      .addCase(updateSHGMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteSHGMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSHGMember.fulfilled, (state, action) => {
        state.loading = false;
        state.members = state.members.filter(m => m.id !== action.payload);
      })
      .addCase(deleteSHGMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedMember, clearError } = shgMemberSlice.actions;
export default shgMemberSlice.reducer;

