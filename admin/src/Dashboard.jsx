import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  People,
  Inventory,
  ShoppingCart,
  TrendingUp,
} from '@mui/icons-material';

const Dashboard = () => {
  const [stats, setStats] = useState([
    {
      title: 'Total Users',
      value: '...',
      icon: <People fontSize="large" />,
      color: '#1A73E8',
    },
    {
      title: 'Products',
      value: '...',
      icon: <Inventory fontSize="large" />,
      color: '#FF6F00',
    },
    {
      title: 'Orders',
      value: '...',
      icon: <ShoppingCart fontSize="large" />,
      color: '#34D399',
    },
    {
      title: 'Revenue',
      value: '...',
      icon: <TrendingUp fontSize="large" />,
      color: '#DC2626',
    },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        // Fetch all data in parallel
        const [usersRes, productsRes, ordersRes] = await Promise.all([
          fetch('http://localhost:5001/api/users', { headers }),
          fetch('http://localhost:5001/api/products', { headers }),
          fetch('http://localhost:5001/api/orders', { headers }),
        ]);

        const [usersData, productsData, ordersData] = await Promise.all([
          usersRes.json(),
          productsRes.json(),
          ordersRes.json(),
        ]);

        // Calculate revenue from orders
        const totalRevenue = ordersData.data?.orders?.reduce((sum, order) => sum + order.totalAmount, 0) || 0;

        // Update stats with real data
        setStats([
          {
            title: 'Total Users',
            value: usersData.data?.users?.length?.toString() || '0',
            icon: <People fontSize="large" />,
            color: '#1A73E8',
          },
          {
            title: 'Products',
            value: productsData.data?.products?.length?.toString() || '0',
            icon: <Inventory fontSize="large" />,
            color: '#FF6F00',
          },
          {
            title: 'Orders',
            value: ordersData.data?.orders?.length?.toString() || '0',
            icon: <ShoppingCart fontSize="large" />,
            color: '#34D399',
          },
          {
            title: 'Revenue',
            value: `NPR ${totalRevenue.toLocaleString()}`,
            icon: <TrendingUp fontSize="large" />,
            color: '#DC2626',
          },
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Keep loading state with error values
        setStats(prev => prev.map(stat => ({ ...stat, value: 'Error' })));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading dashboard data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 700 }}>
        JerseyNexus Dashboard
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
                border: `1px solid ${stat.color}20`,
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{ fontWeight: 600 }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {stat.title}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      color: stat.color,
                      backgroundColor: `${stat.color}10`,
                      p: 1,
                      borderRadius: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Welcome to JerseyNexus Admin
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your e-commerce platform with powerful admin tools. Monitor sales, 
          manage products, handle orders, and maintain your customer base all from 
          this central dashboard.
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;