import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { getApiUrl, API_ENDPOINTS } from './config';

export type TicketType = 'shg' | 'shg_member';
export type TicketStatus = 'pending' | 'approved' | 'rejected';

export interface DeleteTicket {
  id: string;
  requestedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  ticketType: TicketType;
  entityId: string;
  entityName?: string;
  reason?: string;
  status: TicketStatus;
  approvedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateDeleteTicketInput =
  | {
      ticketType: 'shg';
      shgNumber: string;
      reason?: string;
    }
  | {
      ticketType: 'shg_member';
      name: string;
      reason?: string;
    };

export interface UpdateDeleteTicketInput {
  status: 'approved' | 'rejected';
}

export interface DeleteTicketState {
  tickets: DeleteTicket[];
  selectedTicket: DeleteTicket | null;
  loading: boolean;
  error: string | null;
}

const initialState: DeleteTicketState = {
  tickets: [],
  selectedTicket: null,
  loading: false,
  error: null,
};

const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const fetchDeleteTickets = createAsyncThunk(
  'deleteTicket/fetchDeleteTickets',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(getApiUrl(API_ENDPOINTS.DELETE_TICKETS), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch delete tickets');
      }

      const result = await response.json();
      return result.data.tickets;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const createDeleteTicket = createAsyncThunk(
  'deleteTicket/createDeleteTicket',
  async (data: CreateDeleteTicketInput, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(getApiUrl(API_ENDPOINTS.DELETE_TICKETS), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to create delete ticket');
      }

      const result = await response.json();
      return result.data.ticket;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const updateDeleteTicket = createAsyncThunk(
  'deleteTicket/updateDeleteTicket',
  async ({ id, data }: { id: string; data: UpdateDeleteTicketInput }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(getApiUrl(`${API_ENDPOINTS.DELETE_TICKETS}/${id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to update delete ticket');
      }

      const result = await response.json();
      return result.data.ticket;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const deleteTicketSlice = createSlice({
  name: 'deleteTicket',
  initialState,
  reducers: {
    setSelectedTicket: (state, action: PayloadAction<DeleteTicket | null>) => {
      state.selectedTicket = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeleteTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeleteTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload;
      })
      .addCase(fetchDeleteTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createDeleteTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDeleteTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets.push(action.payload);
      })
      .addCase(createDeleteTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateDeleteTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDeleteTicket.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tickets.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
      })
      .addCase(updateDeleteTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedTicket, clearError } = deleteTicketSlice.actions;
export default deleteTicketSlice.reducer;

