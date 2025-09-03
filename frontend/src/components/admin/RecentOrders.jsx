import React, { useState, useEffect } from 'react';
import { orderAPI } from '../../utils/api';

const RecentOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  const fetchRecentOrders = async () => {
    try {
      const response = await orderAPI.getOrders({ limit: 5 });
      setOrders(response.data.data.orders || []);
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      // Mock data for demonstration if API fails
      setOrders([
        {
          id: '1',
          orderNumber: 'ORD-001',
          user: { name: 'John Doe', email: 'john@example.com' },
          totalAmount: 4500,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          items: [{ product: { name: 'Manchester United Home Jersey' }, quantity: 1 }]
        },
        {
          id: '2',
          orderNumber: 'ORD-002',
          user: { name: 'Jane Smith', email: 'jane@example.com' },
          totalAmount: 9600,
          status: 'PROCESSING',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          items: [{ product: { name: 'Barcelona Home Jersey' }, quantity: 2 }]
        },
        {
          id: '3',
          orderNumber: 'ORD-003',
          user: { name: 'Mike Johnson', email: 'mike@example.com' },
          totalAmount: 7200,
          status: 'SHIPPED',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          items: [{ product: { name: 'Real Madrid Away Jersey' }, quantity: 1 }]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PROCESSING': 'bg-blue-100 text-blue-800',
      'SHIPPED': 'bg-purple-100 text-purple-800',
      'OUT_FOR_DELIVERY': 'bg-indigo-100 text-indigo-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h2>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All Orders →
          </button>
        </div>
      </div>

      <div className="p-6">
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recent orders</h3>
            <p className="text-gray-500">Orders will appear here once customers start purchasing.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {order.user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        {order.orderNumber || `#${order.id.slice(-8)}`}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.user?.name || 'Unknown Customer'} • {order.items?.length || 0} item(s)
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(order.totalAmount)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.items?.[0]?.product?.name || 'Product'}
                    {order.items?.length > 1 && ` +${order.items.length - 1} more`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentOrders;
