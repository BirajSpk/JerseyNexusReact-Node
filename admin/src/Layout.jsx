import React from 'react';
import { Layout as RALayout, AppBar, UserMenu, Logout } from 'react-admin';
import { Typography, Box } from '@mui/material';

const CustomAppBar = (props) => (
  <AppBar {...props}>
    <Typography variant="h6" sx={{ flex: 1, fontWeight: 600 }}>
      JerseyNexus Admin
    </Typography>
    <UserMenu>
      <Logout />
    </UserMenu>
  </AppBar>
);

const Layout = (props) => (
  <RALayout {...props} appBar={CustomAppBar} />
);

export default Layout;