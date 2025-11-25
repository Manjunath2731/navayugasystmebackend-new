import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import RepaymentAnalytics from '../components/RepaymentAnalytics';
import type { RootState } from '../store/store';

const OwnerDashboard: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {auth.user?.firstName}!</h1>
              <p className="text-indigo-100 text-lg">Monitor SHG repayment status and manage your organization</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/dashboard/ems')}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md hover:border-indigo-300 transition-all duration-200 text-left group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Employees</h3>
            <p className="text-sm text-gray-500">Manage team members</p>
          </button>

          <button
            onClick={() => navigate('/dashboard/shgs')}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 text-left group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Manage SHGs</h3>
            <p className="text-sm text-gray-500">View and manage SHG records</p>
          </button>

          <button
            onClick={() => navigate('/dashboard/linkages')}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md hover:border-green-300 transition-all duration-200 text-left group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Linkages</h3>
            <p className="text-sm text-gray-500">Manage linkage information</p>
          </button>

          <button
            onClick={() => navigate('/dashboard/delete-tickets')}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md hover:border-orange-300 transition-all duration-200 text-left group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Delete Tickets</h3>
            <p className="text-sm text-gray-500">Review deletion requests</p>
          </button>
        </div>

        {/* Repayment Analytics Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Repayment Analytics</h2>
                <p className="mt-1 text-sm text-gray-500">Monitor SHG repayment status and upcoming dues</p>
              </div>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Real-time Analytics</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <RepaymentAnalytics />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OwnerDashboard;
