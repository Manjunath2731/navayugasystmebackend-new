import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRepaymentAnalytics } from '../store/repaymentAnalyticsSlice';
import type { RootState, AppDispatch } from '../store/store';

const RepaymentAnalytics: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { analytics, loading, error } = useSelector((state: RootState) => state.repaymentAnalytics);

  useEffect(() => {
    dispatch(fetchRepaymentAnalytics());
  }, [dispatch]);

  // Debug: Log analytics data
  useEffect(() => {
    if (analytics) {
      console.log('Repayment Analytics Data:', analytics);
    }
    if (error) {
      console.error('Repayment Analytics Error:', error);
    }
  }, [analytics, error]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl shadow-sm p-6">
        <p className="text-red-800 font-medium">Error loading analytics</p>
        <p className="text-red-600 text-sm mt-2">{error}</p>
        <button
          onClick={() => dispatch(fetchRepaymentAnalytics())}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  const allUpcoming = [
    ...analytics.upcomingRepayments.today,
    ...analytics.upcomingRepayments.tomorrow,
    ...analytics.upcomingRepayments.in2Days,
    ...analytics.upcomingRepayments.in3Days,
  ];

  const totalNotifications = allUpcoming.length + analytics.mismatchedRepayments.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content - Left Side */}
      <div className="lg:col-span-2 space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total SHGs</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{analytics.totalSHGs}</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-3">
              <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Repayments</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{analytics.totalRepayments}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Collected</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">₹{analytics.totalAmountCollected.toLocaleString()}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Repayment</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">₹{Math.round(analytics.averageRepaymentAmount).toLocaleString()}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method & Type Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-lg p-2 mr-3">
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">UPI</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{analytics.repaymentsByMethod.upi}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-lg p-2 mr-3">
                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">Cash</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{analytics.repaymentsByMethod.cash}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Type</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-indigo-100 rounded-lg p-2 mr-3">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">Full Amount</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{analytics.repaymentsByType.full}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-yellow-100 rounded-lg p-2 mr-3">
                  <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">Half Amount</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{analytics.repaymentsByType.half}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Repayments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Repayments</h3>
        {allUpcoming.length > 0 ? (
          <div className="space-y-4">
            {analytics.upcomingRepayments.today.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-red-700 mb-2">Due Today ({analytics.upcomingRepayments.today.length})</h4>
                <div className="space-y-2">
                  {analytics.upcomingRepayments.today.map((repayment) => (
                    <div key={repayment.shgId} className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{repayment.shgName}</p>
                          <p className="text-sm text-gray-600">{repayment.branch} • {repayment.fieldOfficerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-red-700">₹{repayment.monthlyRepaymentAmount.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Due Today</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analytics.upcomingRepayments.tomorrow.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-orange-700 mb-2">Due Tomorrow ({analytics.upcomingRepayments.tomorrow.length})</h4>
                <div className="space-y-2">
                  {analytics.upcomingRepayments.tomorrow.map((repayment) => (
                    <div key={repayment.shgId} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{repayment.shgName}</p>
                          <p className="text-sm text-gray-600">{repayment.branch} • {repayment.fieldOfficerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-orange-700">₹{repayment.monthlyRepaymentAmount.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Due Tomorrow</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analytics.upcomingRepayments.in2Days.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-yellow-700 mb-2">Due in 2 Days ({analytics.upcomingRepayments.in2Days.length})</h4>
                <div className="space-y-2">
                  {analytics.upcomingRepayments.in2Days.map((repayment) => (
                    <div key={repayment.shgId} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{repayment.shgName}</p>
                          <p className="text-sm text-gray-600">{repayment.branch} • {repayment.fieldOfficerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-yellow-700">₹{repayment.monthlyRepaymentAmount.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Due in 2 days</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analytics.upcomingRepayments.in3Days.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-blue-700 mb-2">Due in 3 Days ({analytics.upcomingRepayments.in3Days.length})</h4>
                <div className="space-y-2">
                  {analytics.upcomingRepayments.in3Days.map((repayment) => (
                    <div key={repayment.shgId} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{repayment.shgName}</p>
                          <p className="text-sm text-gray-600">{repayment.branch} • {repayment.fieldOfficerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-700">₹{repayment.monthlyRepaymentAmount.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Due in 3 days</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No upcoming repayments in the next 3 days</p>
          </div>
        )}
      </div>

      {/* Mismatched Repayments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Repayment Amount Mismatches</h3>
        {analytics.mismatchedRepayments.length > 0 ? (
          <div className="space-y-3">
            {analytics.mismatchedRepayments.map((mismatch) => (
              <div key={mismatch.shgId} className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{mismatch.shgName}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Date: {new Date(mismatch.repaymentDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Expected: <span className="font-semibold text-green-700">₹{mismatch.expectedAmount.toLocaleString()}</span></p>
                    <p className="text-sm text-gray-600">Actual: <span className="font-semibold text-red-700">₹{mismatch.actualAmount.toLocaleString()}</span></p>
                    <p className="text-xs text-red-600 mt-1">
                      Difference: ₹{Math.abs(mismatch.expectedAmount - mismatch.actualAmount).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No repayment amount mismatches found</p>
          </div>
        )}
      </div>
      </div>

      {/* Notifications Sidebar - Right Side */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {totalNotifications > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
                {totalNotifications}
              </span>
            )}
          </div>

          <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Today's Repayments */}
            {analytics.upcomingRepayments.today.length > 0 && (
              <div>
                <div className="flex items-center mb-2">
                  <div className="bg-red-100 rounded-full p-1.5 mr-2">
                    <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-red-700">Due Today</h4>
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                    {analytics.upcomingRepayments.today.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {analytics.upcomingRepayments.today.map((repayment) => (
                    <div key={repayment.shgId} className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-3 hover:bg-red-100 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{repayment.shgName}</p>
                          <p className="text-xs text-gray-600 mt-1">{repayment.branch}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{repayment.fieldOfficerName}</p>
                        </div>
                        <div className="text-right ml-2">
                          <p className="font-bold text-red-700 text-sm">₹{repayment.monthlyRepaymentAmount.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tomorrow's Repayments */}
            {analytics.upcomingRepayments.tomorrow.length > 0 && (
              <div>
                <div className="flex items-center mb-2">
                  <div className="bg-orange-100 rounded-full p-1.5 mr-2">
                    <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-orange-700">Due Tomorrow</h4>
                  <span className="ml-auto bg-orange-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                    {analytics.upcomingRepayments.tomorrow.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {analytics.upcomingRepayments.tomorrow.map((repayment) => (
                    <div key={repayment.shgId} className="bg-orange-50 border-l-4 border-orange-500 rounded-r-lg p-3 hover:bg-orange-100 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{repayment.shgName}</p>
                          <p className="text-xs text-gray-600 mt-1">{repayment.branch}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{repayment.fieldOfficerName}</p>
                        </div>
                        <div className="text-right ml-2">
                          <p className="font-bold text-orange-700 text-sm">₹{repayment.monthlyRepaymentAmount.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* In 2 Days Repayments */}
            {analytics.upcomingRepayments.in2Days.length > 0 && (
              <div>
                <div className="flex items-center mb-2">
                  <div className="bg-yellow-100 rounded-full p-1.5 mr-2">
                    <svg className="h-4 w-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-yellow-700">Due in 2 Days</h4>
                  <span className="ml-auto bg-yellow-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                    {analytics.upcomingRepayments.in2Days.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {analytics.upcomingRepayments.in2Days.map((repayment) => (
                    <div key={repayment.shgId} className="bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg p-3 hover:bg-yellow-100 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{repayment.shgName}</p>
                          <p className="text-xs text-gray-600 mt-1">{repayment.branch}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{repayment.fieldOfficerName}</p>
                        </div>
                        <div className="text-right ml-2">
                          <p className="font-bold text-yellow-700 text-sm">₹{repayment.monthlyRepaymentAmount.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* In 3 Days Repayments */}
            {analytics.upcomingRepayments.in3Days.length > 0 && (
              <div>
                <div className="flex items-center mb-2">
                  <div className="bg-blue-100 rounded-full p-1.5 mr-2">
                    <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-blue-700">Due in 3 Days</h4>
                  <span className="ml-auto bg-blue-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                    {analytics.upcomingRepayments.in3Days.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {analytics.upcomingRepayments.in3Days.map((repayment) => (
                    <div key={repayment.shgId} className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-3 hover:bg-blue-100 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{repayment.shgName}</p>
                          <p className="text-xs text-gray-600 mt-1">{repayment.branch}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{repayment.fieldOfficerName}</p>
                        </div>
                        <div className="text-right ml-2">
                          <p className="font-bold text-blue-700 text-sm">₹{repayment.monthlyRepaymentAmount.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mismatched Repayments */}
            {analytics.mismatchedRepayments.length > 0 && (
              <div>
                <div className="flex items-center mb-2">
                  <div className="bg-red-100 rounded-full p-1.5 mr-2">
                    <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-semibold text-red-700">Amount Mismatch</h4>
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                    {analytics.mismatchedRepayments.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {analytics.mismatchedRepayments.map((mismatch) => (
                    <div key={mismatch.shgId} className="bg-red-50 border-l-4 border-red-600 rounded-r-lg p-3 hover:bg-red-100 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{mismatch.shgName}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {new Date(mismatch.repaymentDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-red-200">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">Expected:</span>
                          <span className="font-semibold text-green-700">₹{mismatch.expectedAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs mt-1">
                          <span className="text-gray-600">Actual:</span>
                          <span className="font-semibold text-red-700">₹{mismatch.actualAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs mt-1">
                          <span className="text-gray-600">Difference:</span>
                          <span className="font-bold text-red-600">₹{Math.abs(mismatch.expectedAmount - mismatch.actualAmount).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Notifications */}
            {totalNotifications === 0 && (
              <div className="text-center py-8">
                <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">No notifications</p>
                <p className="text-gray-400 text-xs mt-1">All clear!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepaymentAnalytics;

