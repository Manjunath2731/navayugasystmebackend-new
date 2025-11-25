import React from 'react';
import DashboardLayout from '../components/DashboardLayout';

const ComingSoon: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl shadow-sm p-8">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center p-5 bg-gray-100 rounded-full">
            <svg 
              className="h-16 w-16 text-gray-400" 
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
          <h1 className="mt-6 text-3xl font-bold text-gray-900">Coming Soon</h1>
          <p className="mt-4 text-lg text-gray-500">
            We're working hard to bring you this feature. Please check back later.
          </p>
          <div className="mt-8">
            <button 
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-all duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ComingSoon;