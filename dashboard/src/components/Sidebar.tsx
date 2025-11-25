import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import type { RootState } from '../store/store';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const auth = useSelector((state: RootState) => state.auth);
  const user = auth.user;
  const location = useLocation();

  // Define navigation items based on user role
  const getNavItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'owner':
        return [
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Employee Management', path: '/dashboard/ems' },
          { name: 'Linkages', path: '/dashboard/linkages' },
          { name: 'SHGs', path: '/dashboard/shgs' },
          { name: 'SHG Members', path: '/dashboard/shg-members' },
          { name: 'Delete Tickets', path: '/dashboard/delete-tickets' },
          { name: 'Settings', path: '/dashboard/settings' },
        ];
      case 'front_desk':
        return [
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'SHGs', path: '/dashboard/shgs' },
          { name: 'SHG Members', path: '/dashboard/shg-members' },
          { name: 'Delete Tickets', path: '/dashboard/delete-tickets' },
          { name: 'Settings', path: '/dashboard/settings' },
        ];
      case 'field_officer':
        return [
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'SHGs', path: '/dashboard/shgs' },
          { name: 'SHG Members', path: '/dashboard/shg-members' },
          { name: 'Monthly Repayments', path: '/dashboard/monthly-repayments' },
          { name: 'Settings', path: '/dashboard/settings' },
        ];
      default:
        return [
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Settings', path: '/dashboard/settings' },
          { name: 'Coming Soon', path: '/dashboard/coming-soon' },
        ];
    }
  };

  const navItems = getNavItems();

  // Simple icon component for navigation items
  const NavIcon = ({ name }: { name: string }) => {
    const icons: Record<string, string> = {
      'Dashboard': 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      'Employee Management': 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      'Reports': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      'Settings': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      'Linkages': 'M13 10V3L4 14h7v7l9-11h-7z',
      'SHGs': 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      'SHG Members': 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      'Delete Tickets': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'Monthly Repayments': 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      'Customer Management': 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      'Appointments': 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zm3-7h8',
      'Field Visits': 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
      'Tasks': 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      'Coming Soon': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    };
    
    const path = icons[name] || 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6';
    
    return (
      <svg 
        className="h-5 w-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d={path}
        ></path>
      </svg>
    );
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-800 to-blue-900 text-white transform transition duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-6 border-b border-blue-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <span className="text-blue-800 font-bold text-lg">N</span>
            </div>
            <h2 className="text-xl font-bold">Navayuga</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-blue-200 lg:hidden focus:outline-none hover:text-white transition-colors"
          >
            <svg 
              className="h-6 w-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <nav className="mt-6 px-2">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                  location.pathname === item.path 
                    ? 'bg-blue-700 text-white shadow-md' 
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white hover:shadow-sm'
                }`}
                onClick={onClose}
              >
                <NavIcon name={item.name} />
                <span className="mx-4">{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-blue-700">
          <div className="flex items-center">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-600"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-medium">
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </span>
              </div>
            )}
            <div className="ml-3">
              <p className="text-sm font-medium text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-blue-200 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;