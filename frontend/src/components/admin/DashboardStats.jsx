import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: 0,
    lowStockProducts: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));
      
      // Fetch multiple endpoints to get comprehensive stats
      const [productsRes, usersRes, ordersRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/products`),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).catch(() => ({ data: { data: { users: [] } } })), // Fallback if endpoint fails
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).catch(() => ({ data: { data: { orders: [] } } })) // Fallback if endpoint fails
      ]);

      const products = productsRes.data.data.products || [];
      const users = usersRes.data.data.users || [];
      const orders = ordersRes.data.data.orders || [];

      // Calculate stats
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const recentOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return orderDate >= weekAgo;
      }).length;
      
      const lowStockProducts = products.filter(product => product.stock < 10).length;

      setStats({
        totalUsers: users.length,
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
        recentOrders,
        lowStockProducts,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard statistics'
      }));
    }
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: '👕',
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: '👥',
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: '📦',
      color: 'bg-purple-500',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Total Revenue',
      value: new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', minimumFractionDigits: 0 }).format(stats.totalRevenue),
      icon: '💰',
      color: 'bg-yellow-500',
      change: '+23%',
      changeType: 'positive'
    },
    {
      title: 'Recent Orders',
      value: stats.recentOrders,
      icon: '🕒',
      color: 'bg-indigo-500',
      change: 'Last 7 days',
      changeType: 'neutral'
    },
    {
      title: 'Low Stock Alert',
      value: stats.lowStockProducts,
      icon: '⚠️',
      color: 'bg-red-500',
      change: 'Items < 10',
      changeType: 'warning'
    }
  ];

  if (stats.loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">❌</span>
          <div>
            <h3 className="text-lg font-medium text-red-800">Error Loading Stats</h3>
            <p className="text-red-600">{stats.error}</p>
            <button
              onClick={fetchDashboardStats}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className={`text-xs mt-1 ${
                card.changeType === 'positive' ? 'text-green-600' :
                card.changeType === 'warning' ? 'text-red-600' :
                'text-gray-500'
              }`}>
                {card.change}
              </p>
            </div>
            <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
              <span className="text-2xl">{card.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
