import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { getApiUrl, API_ENDPOINTS } from './config';

export interface Employee {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'front_desk' | 'field_officer';
  dashboards: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'front_desk' | 'field_officer';
}

export interface UpdateEmployeeInput {
  firstName?: string;
  lastName?: string;
  role?: 'owner' | 'front_desk' | 'field_officer';
  dashboards?: string[];
  isActive?: boolean;
}

export interface EmployeeState {
  employees: Employee[];
  selectedEmployee: Employee | null;
  loading: boolean;
  error: string | null;
  filters: {
    role: string | null;
    status: 'all' | 'active' | 'inactive';
    search: string;
  };
}

const initialState: EmployeeState = {
  employees: [],
  selectedEmployee: null,
  loading: false,
  error: null,
  filters: {
    role: null,
    status: 'all',
    search: '',
  },
};

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Async thunk for fetching all employees
export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(getApiUrl(API_ENDPOINTS.USERS), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch employees');
      }

      const data = await response.json();
      return data.data.users;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Async thunk for creating an employee
export const createEmployee = createAsyncThunk(
  'employees/createEmployee',
  async (employeeData: CreateEmployeeInput, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(getApiUrl(API_ENDPOINTS.USERS), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to create employee');
      }

      const data = await response.json();
      return data.data.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Async thunk for updating an employee
export const updateEmployee = createAsyncThunk(
  'employees/updateEmployee',
  async ({ id, ...updateData }: { id: string } & UpdateEmployeeInput, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(getApiUrl(`${API_ENDPOINTS.USERS}/${id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to update employee');
      }

      const data = await response.json();
      return data.data.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Async thunk for deleting (deactivating) an employee
export const deleteEmployee = createAsyncThunk(
  'employees/deleteEmployee',
  async (id: string, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(getApiUrl(`${API_ENDPOINTS.USERS}/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to delete employee');
      }

      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setSelectedEmployee: (state, action: PayloadAction<Employee | null>) => {
      state.selectedEmployee = action.payload;
    },
    setRoleFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.role = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<'all' | 'active' | 'inactive'>) => {
      state.filters.status = action.payload;
    },
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        role: null,
        status: 'all',
        search: '',
      };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch employees
    builder.addCase(fetchEmployees.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchEmployees.fulfilled, (state, action) => {
      state.loading = false;
      state.employees = action.payload;
    });
    builder.addCase(fetchEmployees.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to fetch employees';
    });

    // Create employee
    builder.addCase(createEmployee.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createEmployee.fulfilled, (state, action) => {
      state.loading = false;
      state.employees.push(action.payload);
    });
    builder.addCase(createEmployee.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to create employee';
    });

    // Update employee
    builder.addCase(updateEmployee.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateEmployee.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.employees.findIndex(emp => emp.id === action.payload.id);
      if (index !== -1) {
        state.employees[index] = action.payload;
      }
      if (state.selectedEmployee?.id === action.payload.id) {
        state.selectedEmployee = action.payload;
      }
    });
    builder.addCase(updateEmployee.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to update employee';
    });

    // Delete employee
    builder.addCase(deleteEmployee.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteEmployee.fulfilled, (state, action) => {
      state.loading = false;
      state.employees = state.employees.filter(emp => emp.id !== action.payload);
      if (state.selectedEmployee?.id === action.payload) {
        state.selectedEmployee = null;
      }
    });
    builder.addCase(deleteEmployee.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || 'Failed to delete employee';
    });
  },
});

export const {
  setSelectedEmployee,
  setRoleFilter,
  setStatusFilter,
  setSearchFilter,
  clearFilters,
  clearError,
} = employeeSlice.actions;

export default employeeSlice.reducer;

