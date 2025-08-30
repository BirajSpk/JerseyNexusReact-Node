import React from 'react';
import { Admin, Resource, CustomRoutes } from 'react-admin';
import { Route } from 'react-router-dom';
import dataProvider from './dataProvider';
import authProvider from './authProvider';
import { jerseyTheme } from './theme';

// Resource components
import { UserList, UserEdit, UserCreate } from './resources/users';
import { ProductList, ProductEdit, ProductCreate } from './resources/products';
import { CategoryList, CategoryEdit, CategoryCreate } from './resources/categories';
import { OrderList, OrderEdit } from './resources/orders';
import { ReviewList, ReviewEdit, ReviewShow } from './resources/reviews';
import { BlogList, BlogEdit, BlogCreate } from './resources/blogs';

// Dashboard
import Dashboard from './Dashboard';

// Custom components
import Layout from './Layout';
import LoginPage from './LoginPage';

const App = () => (
  <Admin
    title="JerseyNexus Admin"
    dataProvider={dataProvider}
    authProvider={authProvider}
    theme={jerseyTheme}
    dashboard={Dashboard}
    layout={Layout}
    loginPage={LoginPage}
  >
    {/* Users */}
    <Resource
      name="users"
      list={UserList}
      edit={UserEdit}
      create={UserCreate}
      recordRepresentation="name"
    />
    
    {/* Products */}
    <Resource
      name="products"
      list={ProductList}
      edit={ProductEdit}
      create={ProductCreate}
      recordRepresentation="name"
    />
    
    {/* Categories */}
    <Resource
      name="categories"
      list={CategoryList}
      edit={CategoryEdit}
      create={CategoryCreate}
      recordRepresentation="name"
    />
    
    {/* Orders */}
    <Resource
      name="orders"
      list={OrderList}
      edit={OrderEdit}
      recordRepresentation={(record) => `Order #${record.id}`}
    />
    
    {/* Reviews */}
    <Resource
      name="reviews"
      list={ReviewList}
      edit={ReviewEdit}
      show={ReviewShow}
      recordRepresentation={(record) => `Review by ${record.user?.name}`}
    />
    
    {/* Blogs */}
    <Resource
      name="blogs"
      list={BlogList}
      edit={BlogEdit}
      create={BlogCreate}
      recordRepresentation="title"
    />
  </Admin>
);

export default App;