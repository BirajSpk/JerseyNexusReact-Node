import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import DashboardStats from '../../components/admin/DashboardStats';
import RecentOrders from '../../components/admin/RecentOrders';
import ProductManagement from '../../components/admin/ProductManagement';
import UserManagement from '../../components/admin/UserManagement';
import OrderManagement from '../../components/admin/OrderManagement';
import CategoryManagement from '../../components/admin/CategoryManagement';
import BlogManagement from '../../components/admin/BlogManagement';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check if user is admin
  if (!isAuthenticated || !user || user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <DashboardStats />
            <RecentOrders />
          </div>
        );
      case 'products':
        return <ProductManagement />;
      case 'users':
        return <UserManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'categories':
        return <CategoryManagement />;
      case 'blogs':
        return <BlogManagement />;
      default:
        return (
          <div className="space-y-6">
            <DashboardStats />
            <RecentOrders />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <AdminHeader 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
