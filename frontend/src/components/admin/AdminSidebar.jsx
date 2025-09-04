import React from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import Logo from '../ui/Logo';

const AdminSidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const dispatch = useDispatch();

  const menuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: '📊',
      description: 'Overview & Analytics'
    },
    {
      id: 'products',
      name: 'Products',
      icon: '👕',
      description: 'Manage Jerseys & Items'
    },
    {
      id: 'categories',
      name: 'Categories',
      icon: '📂',
      description: 'Product & Blog Categories'
    },
    {
      id: 'orders',
      name: 'Orders',
      icon: '📦',
      description: 'Order Management'
    },
    {
      id: 'users',
      name: 'Users',
      icon: '👥',
      description: 'User Management'
    },
    {
      id: 'blogs',
      name: 'Blogs',
      icon: '📝',
      description: 'Content Management'
    }
  ];

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 z-50 ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          {isOpen ? (
            <Logo size="md" animated={true} showText={true} variant="dark" />
          ) : (
            <Logo size="md" animated={true} showText={false} variant="dark" />
          )}
          {isOpen && (
            <div className="ml-2">
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-800 transition-colors ${
              activeTab === item.id ? 'bg-blue-600 border-r-4 border-blue-400' : ''
            }`}
          >
            <span className="text-xl mr-3">{item.icon}</span>
            {isOpen && (
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-gray-400">{item.description}</div>
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-2 py-2 text-left hover:bg-gray-800 transition-colors rounded"
        >
          <span className="text-xl mr-3">🚪</span>
          {isOpen && <span className="font-medium">Logout</span>}
        </button>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-6 w-6 h-6 bg-gray-900 border border-gray-600 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
      >
        <span className="text-xs text-white">
          {isOpen ? '←' : '→'}
        </span>
      </button>
    </div>
  );
};

export default AdminSidebar;
