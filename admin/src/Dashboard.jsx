import React from 'react';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Box,
} from '@mui/material';
import {
  People,
  Inventory,
  ShoppingCart,
  TrendingUp,
} from '@mui/icons-material';

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      icon: <People fontSize="large" />,
      color: '#1A73E8',
    },
    {
      title: 'Products',
      value: '567',
      icon: <Inventory fontSize="large" />,
      color: '#FF6F00',
    },
    {
      title: 'Orders',
      value: '890',
      icon: <ShoppingCart fontSize="large" />,
      color: '#34D399',
    },
    {
      title: 'Revenue',
      value: 'NPR 12,345',
      icon: <TrendingUp fontSize="large" />,
      color: '#DC2626',
    },
  ];

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