import React from 'react';
import { useSelector } from 'react-redux';
import DashboardLayout from '../components/DashboardLayout';
import type { RootState } from '../store/store';

const FieldOfficerDashboard: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth);
  
  // Stats data
  const stats = [
    {
      name: 'Scheduled Visits',
      value: '12',
      change: '+3 from last week',
      icon: (
        <svg 
          className="h-6 w-6 text-indigo-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          ></path>
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          ></path>
        </svg>
      ),
      color: 'bg-indigo-50',
      changeType: 'positive'
    },
    {
      name: 'Completed Visits',
      value: '8',
      change: '+2 from yesterday',
      icon: (
        <svg 
          className="h-6 w-6 text-green-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      ),
      color: 'bg-green-50',
      changeType: 'positive'
    },
    {
      name: 'Pending Tasks',
      value: '4',
      change: '-1 from yesterday',
      icon: (
        <svg 
          className="h-6 w-6 text-yellow-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      ),
      color: 'bg-yellow-50',
      changeType: 'positive'
    },
    {
      name: 'Reports Submitted',
      value: '15',
      change: '+3 this week',
      icon: (
        <svg 
          className="h-6 w-6 text-purple-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          ></path>
        </svg>
      ),
      color: 'bg-purple-50',
      changeType: 'positive'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {auth.user?.firstName}!</h1>
              <p className="mt-2 text-indigo-100">Here's what's on your field schedule today.</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                  <span className="text-xl font-bold">
                    {auth.user?.firstName?.charAt(0)}
                    {auth.user?.lastName?.charAt(0)}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="font-medium">{auth.user?.firstName} {auth.user?.lastName}</p>
                  <p className="text-sm text-indigo-200 capitalize">{auth.user?.role?.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={`${stat.color} rounded-xl shadow-sm p-6 transition-all duration-200 hover:shadow-md`}
            >
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-white bg-opacity-80">
                  {stat.icon}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className={`text-sm ${stat.changeType === 'positive' ? 'text-green-600' : 'text-gray-500'}`}>
                  {stat.change}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
                Start Visit
              </button>
              <button className="bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
                View Schedule
              </button>
              <button className="bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
                Submit Report
              </button>
              <button className="bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md">
                Request Support
              </button>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Today's Schedule</h3>
            <div className="space-y-4">
              <div className="flex items-center p-3 rounded-lg border border-gray-200">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-800 font-medium">9</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Property Inspection</p>
                  <p className="text-xs text-gray-500">9:00 AM - 123 Main St</p>
                </div>
              </div>
              <div className="flex items-center p-3 rounded-lg border border-gray-200">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-800 font-medium">1</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Client Meeting</p>
                  <p className="text-xs text-gray-500">1:00 PM - 456 Oak Ave</p>
                </div>
              </div>
              <div className="flex items-center p-3 rounded-lg border border-gray-200">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-800 font-medium">4</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Document Review</p>
                  <p className="text-xs text-gray-500">4:00 PM - Office</p>
                </div>
              </div>
            </div>
            <button className="mt-4 w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-800">
              View full schedule
            </button>
          </div>
        </div>

        {/* Coming Soon Message */}
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-gray-100 rounded-full">
            <svg 
              className="h-12 w-12 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              ></path>
            </svg>
          </div>
          <h3 className="mt-4 text-xl font-bold text-gray-900">More Features Coming Soon</h3>
          <p className="mt-2 text-gray-500 max-w-md mx-auto">
            We're working on adding more features to enhance your experience. Stay tuned for updates!
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FieldOfficerDashboard;