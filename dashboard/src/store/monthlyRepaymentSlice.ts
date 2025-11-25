import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiUrl, API_ENDPOINTS } from './config';

export const PaymentMethod = {
  UPI: 'upi',
  CASH: 'cash'
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

export const PaymentType = {
  FULL: 'full',
  HALF: 'half'
} as const;

export type PaymentType = typeof PaymentType[keyof typeof PaymentType];

export interface MonthlyRepayment {
  id: string;
  shgId: string;
  shgName: string;
  repaymentDate: string;
  amount: number;
  receiptPhoto: string;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  unpaidMemberName?: string;
  recordedBy: string;
  recordedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMonthlyRepaymentInput {
  shgId: string;
  repaymentDate: string;
  amount: number;
  receiptPhoto: string;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  unpaidMemberName?: string;
}

export interface UpdateMonthlyRepaymentInput {
  repaymentDate?: string;
  amount?: number;
  receiptPhoto?: string;
  paymentMethod?: PaymentMethod;
  paymentType?: PaymentType;
  unpaidMemberName?: string;
}

interface MonthlyRepaymentState {
  repayments: MonthlyRepayment[];
  loading: boolean;
  error: string | null;
}

const initialState: MonthlyRepaymentState = {
  repayments: [],
  loading: false,
  error: null,
};

export const fetchMonthlyRepayments = createAsyncThunk(
  'monthlyRepayments/fetchAll',
  async (shgId?: string) => {
    const token = localStorage.getItem('token');
    const url = shgId 
      ? getApiUrl(`${API_ENDPOINTS.MONTHLY_REPAYMENTS}?shgId=${shgId}`)
      : getApiUrl(API_ENDPOINTS.MONTHLY_REPAYMENTS);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch monthly repayments');
    }

    const data = await response.json();
    return data.data;
  }
);

export const createMonthlyRepayment = createAsyncThunk(
  'monthlyRepayments/create',
  async (input: CreateMonthlyRepaymentInput) => {
    const token = localStorage.getItem('token');
    const response = await fetch(getApiUrl(API_ENDPOINTS.MONTHLY_REPAYMENTS), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create monthly repayment');
    }

    const data = await response.json();
    return data.data;
  }
);

export const updateMonthlyRepayment = createAsyncThunk(
  'monthlyRepayments/update',
  async ({ id, input }: { id: string; input: UpdateMonthlyRepaymentInput }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(getApiUrl(`${API_ENDPOINTS.MONTHLY_REPAYMENTS}/${id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update monthly repayment');
    }

    const data = await response.json();
    return data.data;
  }
);

export const deleteMonthlyRepayment = createAsyncThunk(
  'monthlyRepayments/delete',
  async (id: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(getApiUrl(`${API_ENDPOINTS.MONTHLY_REPAYMENTS}/${id}`), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete monthly repayment');
    }

    return id;
  }
);

const monthlyRepaymentSlice = createSlice({
  name: 'monthlyRepayments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMonthlyRepayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMonthlyRepayments.fulfilled, (state, action) => {
        state.loading = false;
        state.repayments = action.payload;
      })
      .addCase(fetchMonthlyRepayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch monthly repayments';
      })
      .addCase(createMonthlyRepayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMonthlyRepayment.fulfilled, (state, action) => {
        state.loading = false;
        state.repayments.unshift(action.payload);
      })
      .addCase(createMonthlyRepayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create monthly repayment';
      })
      .addCase(updateMonthlyRepayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMonthlyRepayment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.repayments.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.repayments[index] = action.payload;
        }
      })
      .addCase(updateMonthlyRepayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update monthly repayment';
      })
      .addCase(deleteMonthlyRepayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMonthlyRepayment.fulfilled, (state, action) => {
        state.loading = false;
        state.repayments = state.repayments.filter(r => r.id !== action.payload);
      })
      .addCase(deleteMonthlyRepayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete monthly repayment';
      });
  },
});

export const { clearError } = monthlyRepaymentSlice.actions;
export default monthlyRepaymentSlice.reducer;

