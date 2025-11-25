import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.ts';
import employeeReducer from './employeeSlice.ts';
import settingsReducer from './settingsSlice.ts';
import linkageReducer from './linkageSlice.ts';
import shgReducer from './shgSlice.ts';
import shgMemberReducer from './shgMemberSlice.ts';
import deleteTicketReducer from './deleteTicketSlice.ts';
import monthlyRepaymentReducer from './monthlyRepaymentSlice.ts';
import repaymentAnalyticsReducer from './repaymentAnalyticsSlice.ts';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    employees: employeeReducer,
    settings: settingsReducer,
    linkages: linkageReducer,
    shgs: shgReducer,
    shgMembers: shgMemberReducer,
    deleteTickets: deleteTicketReducer,
    monthlyRepayments: monthlyRepaymentReducer,
    repaymentAnalytics: repaymentAnalyticsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;