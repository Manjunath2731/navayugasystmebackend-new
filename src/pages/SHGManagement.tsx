import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import {
  fetchSHGs,
  createSHG,
  updateSHG,
  deleteSHG,
  clearError,
} from '../store/shgSlice';
import { fetchLinkages } from '../store/linkageSlice';
import { fetchEmployees } from '../store/employeeSlice';
import type { RootState, AppDispatch } from '../store/store';
import type { SHG, CreateSHGInput, UpdateSHGInput } from '../store/shgSlice';

const SHGManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { shgs, loading, error, pagination } = useSelector((state: RootState) => state.shgs);
  const { linkages } = useSelector((state: RootState) => state.linkages);
  const { employees } = useSelector((state: RootState) => state.employees);
  const { user } = useSelector((state: RootState) => state.auth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSHG, setSelectedSHG] = useState<SHG | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [formData, setFormData] = useState<CreateSHGInput>({
    shgName: '',
    shgAddress: '',
    savingAccountNumber: '',
    loanAccountNumber: '',
    loanSanctionDate: '',
    repaymentDate: '',
    fieldOfficerId: '',
    branch: '',
    loanSanctionAmount: 0,
    numberOfMonths: 12,
    monthlyRepaymentAmount: 0,
    fixedDeposit: 0,
    linkageId: '',
    numberOfMembers: 0,
  });

  useEffect(() => {
    if (user && (user.role === 'owner' || user.role === 'front_desk')) {
      dispatch(fetchSHGs({ page: currentPage, limit: itemsPerPage }));
      dispatch(fetchLinkages());
      if (user.role === 'owner') {
        dispatch(fetchEmployees());
      }
    }
  }, [dispatch, user, currentPage, itemsPerPage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const fieldOfficers = employees.filter(emp => emp.role === 'field_officer' && emp.isActive);

  const handleAdd = () => {
    setSelectedSHG(null);
    setFormData({
      shgName: '',
      shgAddress: '',
      savingAccountNumber: '',
      loanAccountNumber: '',
      loanSanctionDate: '',
      repaymentDate: '',
      fieldOfficerId: '',
      branch: '',
      loanSanctionAmount: 0,
      numberOfMonths: 12,
      monthlyRepaymentAmount: 0,
      fixedDeposit: 0,
      linkageId: '',
      numberOfMembers: 0,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (shg: SHG) => {
    setSelectedSHG(shg);
    setFormData({
      shgName: shg.shgName,
      shgAddress: shg.shgAddress,
      savingAccountNumber: shg.savingAccountNumber,
      loanAccountNumber: shg.loanAccountNumber,
      loanSanctionDate: shg.loanSanctionDate.split('T')[0],
      repaymentDate: shg.repaymentDate.split('T')[0],
      fieldOfficerId: shg.fieldOfficerId,
      branch: shg.branch,
      loanSanctionAmount: shg.loanSanctionAmount,
      numberOfMonths: shg.numberOfMonths,
      monthlyRepaymentAmount: shg.monthlyRepaymentAmount,
      fixedDeposit: shg.fixedDeposit,
      linkageId: shg.linkageId,
      numberOfMembers: shg.numberOfMembers,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedSHG) {
        await dispatch(updateSHG({ id: selectedSHG.id, data: formData as UpdateSHGInput })).unwrap();
      } else {
        await dispatch(createSHG(formData)).unwrap();
      }
      setIsModalOpen(false);
      setSelectedSHG(null);
      // If creating new SHG, go to first page to see it
      if (!selectedSHG) {
        setCurrentPage(1);
        dispatch(fetchSHGs({ page: 1, limit: itemsPerPage }));
      } else {
        dispatch(fetchSHGs({ page: currentPage, limit: itemsPerPage }));
      }
    } catch (err) {
      console.error('Error saving SHG:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteSHG(id)).unwrap();
      setDeleteConfirm(null);
      // If we're on the last page and it becomes empty, go to previous page
      if (pagination && currentPage > 1 && shgs.length === 1) {
        setCurrentPage(currentPage - 1);
      } else {
        dispatch(fetchSHGs({ page: currentPage, limit: itemsPerPage }));
      }
    } catch (err) {
      console.error('Error deleting SHG:', err);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleViewMembers = (shgId: string) => {
    navigate(`/dashboard/shg-members?shgId=${shgId}`);
  };

  if (user && user.role !== 'owner' && user.role !== 'front_desk') {
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
            <h1 className="text-2xl font-bold text-gray-900">SHG Management</h1>
            <p className="mt-1 text-sm text-gray-500">Manage Self Help Groups</p>
          </div>
          {(user?.role === 'owner' || user?.role === 'front_desk') && (
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all"
            >
              Add SHG
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* SHGs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : shgs.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No SHGs found. Add your first SHG to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SHG Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SHG Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field Officer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shgs.map((shg) => (
                    <tr key={shg.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-indigo-600">{shg.shgNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{shg.shgName}</div>
                        <div className="text-sm text-gray-500">{shg.shgAddress}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{shg.branch}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {shg.fieldOfficer ? `${shg.fieldOfficer.firstName} ${shg.fieldOfficer.lastName}` : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">₹{shg.loanSanctionAmount.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{shg.numberOfMembers}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewMembers(shg.id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Members
                        </button>
                        {(user?.role === 'owner' || user?.role === 'front_desk') && (
                          <>
                            <button
                              onClick={() => handleEdit(shg)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              Edit
                            </button>
                            {user?.role === 'owner' && (
                              <button
                                onClick={() => setDeleteConfirm(shg.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination && (
            <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Items per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                </span>
              </div>
              {pagination.totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1 border rounded-lg text-sm font-medium ${
                            pagination.page === pageNum
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="fixed inset-0 bg-opacity-75 backdrop-blur-sm z-[101]" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-gray-100 border border-gray-400 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto z-[102]">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {selectedSHG ? 'Edit SHG' : 'Add SHG'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SHG Name *</label>
                    <input
                      type="text"
                      value={formData.shgName}
                      onChange={(e) => setFormData({ ...formData, shgName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Branch *</label>
                    <input
                      type="text"
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SHG Address *</label>
                  <textarea
                    value={formData.shgAddress}
                    onChange={(e) => setFormData({ ...formData, shgAddress: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={2}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Saving Account Number *</label>
                    <input
                      type="text"
                      value={formData.savingAccountNumber}
                      onChange={(e) => setFormData({ ...formData, savingAccountNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Loan Account Number *</label>
                    <input
                      type="text"
                      value={formData.loanAccountNumber}
                      onChange={(e) => setFormData({ ...formData, loanAccountNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Loan Sanction Date *</label>
                    <input
                      type="date"
                      value={formData.loanSanctionDate}
                      onChange={(e) => setFormData({ ...formData, loanSanctionDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
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
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Field Officer *</label>
                    <select
                      value={formData.fieldOfficerId}
                      onChange={(e) => setFormData({ ...formData, fieldOfficerId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select Field Officer</option>
                      {fieldOfficers.map((fo) => (
                        <option key={fo.id} value={fo.id}>
                          {fo.firstName} {fo.lastName} ({fo.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Linkage *</label>
                    <select
                      value={formData.linkageId}
                      onChange={(e) => setFormData({ ...formData, linkageId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select Linkage</option>
                      {linkages.map((linkage) => (
                        <option key={linkage.id} value={linkage.id}>
                          {linkage.name} (₹{linkage.amount.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Loan Sanction Amount *</label>
                    <input
                      type="number"
                      value={formData.loanSanctionAmount}
                      onChange={(e) => setFormData({ ...formData, loanSanctionAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Months *</label>
                    <input
                      type="number"
                      value={formData.numberOfMonths}
                      onChange={(e) => setFormData({ ...formData, numberOfMonths: parseInt(e.target.value) || 12 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Repayment Amount *</label>
                    <input
                      type="number"
                      value={formData.monthlyRepaymentAmount}
                      onChange={(e) => setFormData({ ...formData, monthlyRepaymentAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fixed Deposit *</label>
                    <input
                      type="number"
                      value={formData.fixedDeposit}
                      onChange={(e) => setFormData({ ...formData, fixedDeposit: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Members *</label>
                  <input
                    type="number"
                    value={formData.numberOfMembers}
                    onChange={(e) => setFormData({ ...formData, numberOfMembers: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="1"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800"
                  >
                    {selectedSHG ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm z-[101]" onClick={() => setDeleteConfirm(null)}></div>
            <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-[102]">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Delete</h2>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this SHG? This will also delete all associated members. This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SHGManagement;

