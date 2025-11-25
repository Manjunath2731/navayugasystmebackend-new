import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiUrl, API_ENDPOINTS } from './config';

export interface UpcomingRepayment {
  shgId: string;
  shgName: string;
  repaymentDate: string;
  monthlyRepaymentAmount: number;
  daysUntil: number;
  branch: string;
  fieldOfficerName: string;
}

export interface RepaymentAnalytics {
  totalSHGs: number;
  totalRepayments: number;
  totalAmountCollected: number;
  averageRepaymentAmount: number;
  repaymentsByMethod: {
    upi: number;
    cash: number;
  };
  repaymentsByType: {
    full: number;
    half: number;
  };
  upcomingRepayments: {
    today: UpcomingRepayment[];
    tomorrow: UpcomingRepayment[];
    in2Days: UpcomingRepayment[];
    in3Days: UpcomingRepayment[];
  };
  mismatchedRepayments: {
    shgId: string;
    shgName: string;
    expectedAmount: number;
    actualAmount: number;
    repaymentDate: string;
  }[];
}

interface RepaymentAnalyticsState {
  analytics: RepaymentAnalytics | null;
  loading: boolean;
  error: string | null;
}

const initialState: RepaymentAnalyticsState = {
  analytics: null,
  loading: false,
  error: null,
};

export const fetchRepaymentAnalytics = createAsyncThunk(
  'repaymentAnalytics/fetch',
  async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(getApiUrl(API_ENDPOINTS.REPAYMENT_ANALYTICS), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch repayment analytics');
    }

    const data = await response.json();
    return data.data;
  }
);

const repaymentAnalyticsSlice = createSlice({
  name: 'repaymentAnalytics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRepaymentAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRepaymentAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchRepaymentAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch repayment analytics';
      });
  },
});

export const { clearError } = repaymentAnalyticsSlice.actions;
export default repaymentAnalyticsSlice.reducer;

