import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../components/DashboardLayout';
import {
  fetchMonthlyRepayments,
  createMonthlyRepayment,
  updateMonthlyRepayment,
  deleteMonthlyRepayment,
  clearError,
  PaymentMethod,
  PaymentType,
} from '../store/monthlyRepaymentSlice';
import { fetchSHGs } from '../store/shgSlice';
import type { RootState, AppDispatch } from '../store/store';
import type { MonthlyRepayment, CreateMonthlyRepaymentInput } from '../store/monthlyRepaymentSlice';

const MonthlyRepaymentEntry: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { repayments, loading, error } = useSelector((state: RootState) => state.monthlyRepayments);
  const { shgs } = useSelector((state: RootState) => state.shgs);
  const { user } = useSelector((state: RootState) => state.auth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRepayment, setSelectedRepayment] = useState<MonthlyRepayment | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [shgSearchQuery, setShgSearchQuery] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<CreateMonthlyRepaymentInput>({
    shgId: '',
    repaymentDate: new Date().toISOString().split('T')[0],
    amount: 0,
    receiptPhoto: '',
    paymentMethod: PaymentMethod.CASH,
    paymentType: PaymentType.FULL,
    unpaidMemberName: '',
  });

  useEffect(() => {
    if (user && user.role === 'field_officer') {
      dispatch(fetchMonthlyRepayments());
      dispatch(fetchSHGs({ page: 1, limit: 1000 })); // Fetch all SHGs for dropdown
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleFileUpload = async (file: File): Promise<string> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    setUploadingReceipt(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload receipt');
      }

      const data = await response.json();
      return data.url;
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleReceiptChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await handleFileUpload(file);
        setFormData({ ...formData, receiptPhoto: url });
      } catch (err) {
        console.error('Error uploading receipt:', err);
        alert('Failed to upload receipt. Please try again.');
      }
    }
  };

  const handleAdd = () => {
    setSelectedRepayment(null);
    setFormData({
      shgId: '',
      repaymentDate: new Date().toISOString().split('T')[0],
      amount: 0,
      receiptPhoto: '',
      paymentMethod: PaymentMethod.CASH,
      paymentType: PaymentType.FULL,
      unpaidMemberName: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (repayment: MonthlyRepayment) => {
    setSelectedRepayment(repayment);
    setFormData({
      shgId: repayment.shgId,
      repaymentDate: repayment.repaymentDate.split('T')[0],
      amount: repayment.amount,
      receiptPhoto: repayment.receiptPhoto,
      paymentMethod: repayment.paymentMethod,
      paymentType: repayment.paymentType,
      unpaidMemberName: repayment.unpaidMemberName || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedRepayment) {
        await dispatch(updateMonthlyRepayment({ id: selectedRepayment.id, input: formData })).unwrap();
      } else {
        await dispatch(createMonthlyRepayment(formData)).unwrap();
      }
      setIsModalOpen(false);
      setSelectedRepayment(null);
      dispatch(fetchMonthlyRepayments());
    } catch (err) {
      console.error('Error saving repayment:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteMonthlyRepayment(id)).unwrap();
      setDeleteConfirm(null);
      dispatch(fetchMonthlyRepayments());
    } catch (err) {
      console.error('Error deleting repayment:', err);
    }
  };

  const filteredSHGs = shgs.filter((shg) => {
    if (!shgSearchQuery) return true;
    const query = shgSearchQuery.toLowerCase();
    return (
      shg.shgName.toLowerCase().includes(query) ||
      shg.branch.toLowerCase().includes(query) ||
      shg.shgAddress.toLowerCase().includes(query)
    );
  });

  if (user && user.role !== 'field_officer') {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">You don't have permission to access this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Monthly Repayment Entry</h1>
            <p className="mt-1 text-sm text-gray-500">Record SHG monthly repayments</p>
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all"
          >
            Add Repayment
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Repayments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : repayments.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No repayments found. Add your first repayment to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SHG Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {repayments.map((repayment) => (
                    <tr key={repayment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{repayment.shgName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(repayment.repaymentDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">₹{repayment.amount.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          repayment.paymentMethod === PaymentMethod.UPI
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {repayment.paymentMethod.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          repayment.paymentType === PaymentType.FULL
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {repayment.paymentType.toUpperCase()}
                        </span>
                        {repayment.paymentType === PaymentType.HALF && repayment.unpaidMemberName && (
                          <div className="text-xs text-gray-500 mt-1">Unpaid: {repayment.unpaidMemberName}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {repayment.receiptPhoto ? (
                          <a
                            href={repayment.receiptPhoto}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-900 text-sm"
                          >
                            View Receipt
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">No receipt</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(repayment)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(repayment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative z-[102] bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedRepayment ? 'Edit Repayment' : 'Add Repayment'}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* SHG Selector */}
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SHG *</label>
                  <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-indigo-500 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        {formData.shgId ? (
                          <div className="text-sm font-medium text-gray-900">
                            {shgs.find(s => s.id === formData.shgId)?.shgName || 'Select an SHG'}
                          </div>
                        ) : (
                          <span className="text-gray-500">Select an SHG...</span>
                        )}
                      </div>
                      <svg
                        className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      <div className="p-3 border-b border-gray-200 bg-gray-50">
                        <input
                          type="text"
                          placeholder="Search SHG..."
                          value={shgSearchQuery}
                          onChange={(e) => setShgSearchQuery(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          autoFocus
                        />
                      </div>
                      <div className="overflow-y-auto max-h-48">
                        {filteredSHGs.map((shg) => (
                          <div
                            key={shg.id}
                            onClick={() => {
                              setFormData({ ...formData, shgId: shg.id });
                              setIsDropdownOpen(false);
                              setShgSearchQuery('');
                            }}
                            className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                              formData.shgId === shg.id ? 'bg-indigo-50' : ''
                            }`}
                          >
                            <div className="text-sm font-medium text-gray-900">{shg.shgName}</div>
                            <div className="text-xs text-gray-500">{shg.branch}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Repayment Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Repayment Date *</label>
                  <input
                    type="date"
                    value={formData.repaymentDate}
                    onChange={(e) => setFormData({ ...formData, repaymentDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value={PaymentMethod.CASH}
                        checked={formData.paymentMethod === PaymentMethod.CASH}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Cash</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value={PaymentMethod.UPI}
                        checked={formData.paymentMethod === PaymentMethod.UPI}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">UPI</span>
                    </label>
                  </div>
                </div>

                {/* Payment Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type *</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value={PaymentType.FULL}
                        checked={formData.paymentType === PaymentType.FULL}
                        onChange={(e) => setFormData({ ...formData, paymentType: e.target.value as PaymentType, unpaidMemberName: '' })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Full Amount</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value={PaymentType.HALF}
                        checked={formData.paymentType === PaymentType.HALF}
                        onChange={(e) => setFormData({ ...formData, paymentType: e.target.value as PaymentType })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Half Amount</span>
                    </label>
                  </div>
                </div>

                {/* Unpaid Member Name (if half payment) */}
                {formData.paymentType === PaymentType.HALF && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unpaid Member Name *</label>
                    <input
                      type="text"
                      value={formData.unpaidMemberName}
                      onChange={(e) => setFormData({ ...formData, unpaidMemberName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                )}

                {/* Receipt Photo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Photo *</label>
                  <input
                    ref={receiptInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleReceiptChange}
                    className="hidden"
                  />
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => receiptInputRef.current?.click()}
                      disabled={uploadingReceipt}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {uploadingReceipt ? 'Uploading...' : formData.receiptPhoto ? 'Change Receipt' : 'Upload Receipt'}
                    </button>
                    {formData.receiptPhoto && (
                      <a
                        href={formData.receiptPhoto}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-900"
                      >
                        View Receipt
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || uploadingReceipt || !formData.receiptPhoto}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : selectedRepayment ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}></div>
            <div className="relative z-[102] bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Repayment</h3>
                <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this repayment? This action cannot be undone.</p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MonthlyRepaymentEntry;

