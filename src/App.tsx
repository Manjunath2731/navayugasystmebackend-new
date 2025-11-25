import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchProfile, clearAuth } from './store/authSlice';
import LoginPage from './pages/LoginPage';
import OwnerDashboard from './pages/OwnerDashboard';
import FrontDeskDashboard from './pages/FrontDeskDashboard';
import FieldOfficerDashboard from './pages/FieldOfficerDashboard';
import EmployeeManagement from './pages/EmployeeManagement';
import Settings from './pages/Settings';
import LinkageManagement from './pages/LinkageManagement';
import SHGManagement from './pages/SHGManagement';
import SHGMembers from './pages/SHGMembers';
import DeleteTickets from './pages/DeleteTickets';
import MonthlyRepaymentEntry from './pages/MonthlyRepaymentEntry';
import ComingSoon from './pages/ComingSoon';
import type { RootState, AppDispatch } from './store/store';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useSelector((state: RootState) => state.auth);
  
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const DashboardRouter: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    // If user is authenticated but no user data, fetch profile
    if (auth.isAuthenticated && !auth.user) {
      dispatch(fetchProfile());
    }
  }, [auth.isAuthenticated, auth.user, dispatch]);
  
  // If we're authenticated but have an error, clear the error after a delay
  // or redirect to login
  useEffect(() => {
    if (auth.isAuthenticated && auth.error) {
      const timer = setTimeout(() => {
        // If profile fetch failed, redirect to login
        if (auth.error && (auth.error.includes('fetch profile') || auth.error.includes('Unauthorized'))) {
          dispatch(clearAuth());
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [auth.isAuthenticated, auth.error, dispatch]);
  
  if (!auth.user && auth.isAuthenticated && auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  // If we have an error and no user data, show error and redirect to login
  if (auth.error && !auth.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{auth.error}</p>
          <p className="text-gray-500 mb-6">Redirecting to login page...</p>
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }
  
  if (!auth.user && !auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  const getDashboardComponent = () => {
    if (!auth.user) return <ComingSoon />;
    
    switch (auth.user.role) {
      case 'owner':
        return <OwnerDashboard />;
      case 'front_desk':
        return <FrontDeskDashboard />;
      case 'field_officer':
        return <FieldOfficerDashboard />;
      default:
        return <ComingSoon />;
    }
  };
  
  return (
    <ProtectedRoute>
      <Routes>
        <Route path="" element={getDashboardComponent()} />
        <Route path="ems" element={<EmployeeManagement />} />
        <Route path="linkages" element={<LinkageManagement />} />
        <Route path="shgs" element={<SHGManagement />} />
        <Route path="shg-members" element={<SHGMembers />} />
        <Route path="delete-tickets" element={<DeleteTickets />} />
        <Route path="monthly-repayments" element={<MonthlyRepaymentEntry />} />
        <Route path="reports" element={<ComingSoon />} />
        <Route path="settings" element={<Settings />} />
        <Route path="customers" element={<ComingSoon />} />
        <Route path="appointments" element={<ComingSoon />} />
        <Route path="visits" element={<ComingSoon />} />
        <Route path="tasks" element={<ComingSoon />} />
        <Route path="coming-soon" element={<ComingSoon />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ProtectedRoute>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard/*" element={<DashboardRouter />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Router>
  );
}

export default App;