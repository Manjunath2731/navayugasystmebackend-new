import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../components/DashboardLayout';
import {
  fetchDeleteTickets,
  createDeleteTicket,
  updateDeleteTicket,
  clearError,
} from '../store/deleteTicketSlice';
import type { RootState, AppDispatch } from '../store/store';
import type { CreateDeleteTicketInput } from '../store/deleteTicketSlice';

const DeleteTickets: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tickets, loading, error } = useSelector((state: RootState) => state.deleteTickets);
  const { user } = useSelector((state: RootState) => state.auth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateDeleteTicketInput>({
    ticketType: 'shg',
    shgNumber: '',
    reason: '',
  });

  useEffect(() => {
    if (user) {
      dispatch(fetchDeleteTickets());
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

  const handleCreateTicket = () => {
    setFormData({
      ticketType: 'shg',
      shgNumber: '',
      reason: '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createDeleteTicket(formData)).unwrap();
      setIsModalOpen(false);
      dispatch(fetchDeleteTickets());
    } catch (err) {
      console.error('Error creating delete ticket:', err);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await dispatch(updateDeleteTicket({ id, data: { status: 'approved' } })).unwrap();
      dispatch(fetchDeleteTickets());
    } catch (err) {
      console.error('Error approving ticket:', err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await dispatch(updateDeleteTicket({ id, data: { status: 'rejected' } })).unwrap();
      dispatch(fetchDeleteTickets());
    } catch (err) {
      console.error('Error rejecting ticket:', err);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getTicketTypeDisplay = (type: string) => {
    return type === 'shg' ? 'SHG' : 'SHG Member';
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

  const pendingTickets = tickets.filter(t => t.status === 'pending');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Delete Tickets</h1>
            <p className="mt-1 text-sm text-gray-500">
              {user?.role === 'owner' 
                ? 'Review and approve/reject delete requests' 
                : 'Request deletion of SHGs or members'}
            </p>
          </div>
          {user?.role === 'front_desk' && (
            <button
              onClick={handleCreateTicket}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all"
            >
              Create Delete Ticket
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Pending Tickets (for owner) */}
        {user?.role === 'owner' && pendingTickets.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Pending Requests</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{getTicketTypeDisplay(ticket.ticketType)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{ticket.entityName || ticket.entityId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {ticket.requestedBy.firstName} {ticket.requestedBy.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{ticket.requestedBy.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{ticket.reason || 'No reason provided'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleApprove(ticket.id)}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(ticket.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* All Tickets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {user?.role === 'owner' ? 'All Tickets' : 'My Delete Tickets'}
            </h2>
          </div>
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No delete tickets found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    {user?.role === 'owner' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved By</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{getTicketTypeDisplay(ticket.ticketType)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{ticket.entityName || ticket.entityId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {ticket.requestedBy.firstName} {ticket.requestedBy.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{ticket.requestedBy.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(ticket.status)}`}>
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{ticket.reason || 'No reason provided'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      {user?.role === 'owner' && ticket.approvedBy && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {ticket.approvedBy.firstName} {ticket.approvedBy.lastName}
                          </div>
                          {ticket.approvedAt && (
                            <div className="text-sm text-gray-500">
                              {new Date(ticket.approvedAt).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Ticket Modal (for front_desk) */}
        {isModalOpen && user?.role === 'front_desk' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="fixed inset-0 bg-opacity-75 backdrop-blur-sm z-[101]" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-gray-100 border border-gray-400 rounded-lg shadow-xl p-6 w-full max-w-md z-[102]">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create Delete Ticket</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select
                    value={formData.ticketType}
                    onChange={(e) => {
                      const newType = e.target.value as 'shg' | 'shg_member';
                      if (newType === 'shg') {
                        setFormData({ ticketType: 'shg', shgNumber: '', reason: formData.reason || '' });
                      } else {
                        setFormData({ ticketType: 'shg_member', name: '', reason: formData.reason || '' });
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="shg">SHG</option>
                    <option value="shg_member">SHG Member</option>
                  </select>
                </div>
                {formData.ticketType === 'shg' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SHG Number *</label>
                    <input
                      type="text"
                      value={formData.shgNumber}
                      onChange={(e) => setFormData({ ...formData, shgNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter SHG number (e.g., NAV20250001)"
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Member Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter member name"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Note: If multiple members have the same name, please use a more specific identifier.
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Optional)</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Explain why you want to delete this entity..."
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
                    Create Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DeleteTickets;

