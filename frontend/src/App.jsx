import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion } from './utils/motion.jsx'; // Temporary motion wrapper

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AppInitializer from './components/AppInitializer';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentSelection from './pages/PaymentSelection';
import OrderSuccess from './pages/OrderSuccess';
import ProductDebug from './pages/ProductDebug';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/admin/AdminDashboard';
import OrderTracking from './pages/OrderTracking';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import KhaltiCallback from './pages/KhaltiCallback';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <AppInitializer>
      <ErrorBoundary>
        <div className="min-h-screen bg-neutral flex flex-col">
        {!isAdminRoute && <Navbar />}

        <motion.main
          className="flex-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/debug/products" element={<ProductDebug />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-selection" element={<PaymentSelection />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failed" element={<PaymentFailed />} />
            <Route path="/khalti/callback" element={<KhaltiCallback />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:slug" element={<BlogDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/orders/:orderId" element={<OrderTracking />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.main>

        {!isAdminRoute && <Footer />}
        </div>
      </ErrorBoundary>
    </AppInitializer>
  );
}

export default App;