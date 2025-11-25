import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createEmployee, updateEmployee, clearError } from '../store/employeeSlice';
import type { RootState, AppDispatch } from '../store/store';
import type { Employee, CreateEmployeeInput, UpdateEmployeeInput } from '../store/employeeSlice';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: Employee | null;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, employee }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.employees);
  
  const isEditMode = !!employee;
  
  const [formData, setFormData] = useState<CreateEmployeeInput & { confirmPassword?: string; isActive?: boolean }>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'front_desk',
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (employee) {
      setFormData({
        email: employee.email,
        password: '',
        confirmPassword: '',
        firstName: employee.firstName,
        lastName: employee.lastName,
        role: employee.role,
        isActive: employee.isActive,
      });
    } else {
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        role: 'front_desk',
        isActive: true,
      });
    }
    setFormErrors({});
    dispatch(clearError());
  }, [employee, isOpen, dispatch]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!isEditMode) {
      if (!formData.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Invalid email address';
      }

      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (isEditMode && employee) {
        const updateData: UpdateEmployeeInput = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          isActive: formData.isActive,
        };
        await dispatch(updateEmployee({ id: employee.id, ...updateData })).unwrap();
      } else {
        const createData: CreateEmployeeInput = {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
        };
        await dispatch(createEmployee(createData)).unwrap();
      }
      onClose();
    } catch (err) {
      // Error is handled by Redux
      console.error('Error saving employee:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Background overlay */}
      <div
        className="fixed inset-0 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal panel */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  {isEditMode ? 'Edit Employee' : 'Add New Employee'}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="bg-white px-6 py-4">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter first name"
                  />
                  {formErrors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter last name"
                  />
                  {formErrors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                  )}
                </div>

                {/* Email (only for new employees) */}
                {!isEditMode && (
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter email address"
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                    )}
                  </div>
                )}

                {/* Password (only for new employees) */}
                {!isEditMode && (
                  <>
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          formErrors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter password (min 6 characters)"
                      />
                      {formErrors.password && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Confirm password"
                      />
                      {formErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                      )}
                    </div>
                  </>
                )}

                {/* Role */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="front_desk">Front Desk</option>
                    <option value="field_officer">Field Officer</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>

                {/* Status Toggle (only in edit mode) */}
                {isEditMode && (
                  <div>
                    <label className="flex items-center justify-between p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <div>
                        <span className="block text-sm font-medium text-gray-700">
                          Account Status
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          {formData.isActive ? 'Employee is currently active' : 'Employee is currently inactive'}
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive || false}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className={`block w-14 h-8 rounded-full transition-colors ${
                          formData.isActive ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                          <div className={`block w-6 h-6 rounded-full bg-white mt-1 ml-1 transform transition-transform ${
                            formData.isActive ? 'translate-x-6' : 'translate-x-0'
                          }`}></div>
                        </div>
                      </div>
                    </label>
                    <div className="mt-2 flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        formData.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {formData.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </span>
                ) : (
                  isEditMode ? 'Update Employee' : 'Create Employee'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeModal;

