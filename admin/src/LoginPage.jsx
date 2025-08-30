import React from 'react';
import { Login, LoginForm } from 'react-admin';
import { Box, Typography, Card, CardContent } from '@mui/material';

const CustomLoginForm = (props) => (
  <Box
    sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1A73E8 0%, #FF6F00 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 2,
    }}
  >
    <Card sx={{ maxWidth: 400, width: '100%', boxShadow: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A73E8', mb: 1 }}>
            JerseyNexus
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 500, color: 'text.secondary' }}>
            Admin Dashboard
          </Typography>
        </Box>
        <LoginForm {...props} />
      </CardContent>
    </Card>
  </Box>
);

const LoginPage = () => <Login loginForm={CustomLoginForm} />;

export default LoginPage;