import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';

// Vendor Pages
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProducts from './pages/vendor/VendorProducts';
import VendorAddProduct from './pages/vendor/VendorAddProduct';
import VendorEditProduct from './pages/vendor/VendorEditProduct';
import VendorOrders from './pages/vendor/VendorOrders';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminVendors from './pages/admin/AdminVendors';
import AdminProducts from './pages/admin/AdminProducts';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                <Navbar />

                <main className="min-h-screen">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />

                    <Route
                      path="/cart"
                      element={
                        <PrivateRoute>
                          <Cart />
                        </PrivateRoute>
                      }
                    />

                    <Route
                      path="/checkout"
                      element={
                        <PrivateRoute>
                          <Checkout />
                        </PrivateRoute>
                      }
                    />

                    <Route
                      path="/orders"
                      element={
                        <PrivateRoute>
                          <Orders />
                        </PrivateRoute>
                      }
                    />

                    <Route
                      path="/orders/:id"
                      element={
                        <PrivateRoute>
                          <OrderDetail />
                        </PrivateRoute>
                      }
                    />

                    <Route
                      path="/profile"
                      element={
                        <PrivateRoute>
                          <Profile />
                        </PrivateRoute>
                      }
                    />

                    <Route
                      path="/wishlist"
                      element={
                        <PrivateRoute>
                          <Wishlist />
                        </PrivateRoute>
                      }
                    />

                    {/* Vendor Routes */}
                    <Route
                      path="/vendor/dashboard"
                      element={
                        <PrivateRoute roles={['vendor', 'admin']}>
                          <VendorDashboard />
                        </PrivateRoute>
                      }
                    />

                    <Route
                      path="/vendor/products"
                      element={
                        <PrivateRoute roles={['vendor', 'admin']}>
                          <VendorProducts />
                        </PrivateRoute>
                      }
                    />

                    <Route
                      path="/vendor/products/add"
                      element={
                        <PrivateRoute roles={['vendor', 'admin']}>
                          <VendorAddProduct />
                        </PrivateRoute>
                      }
                    />

                    <Route
                      path="/vendor/products/edit/:id"
                      element={
                        <PrivateRoute roles={['vendor', 'admin']}>
                          <VendorEditProduct />
                        </PrivateRoute>
                      }
                    />

                    <Route
                      path="/vendor/orders"
                      element={
                        <PrivateRoute roles={['vendor', 'admin']}>
                          <VendorOrders />
                        </PrivateRoute>
                      }
                    />

                    {/* Admin Routes */}
                    <Route
                      path="/admin/dashboard"
                      element={
                        <PrivateRoute roles={['admin']}>
                          <AdminDashboard />
                        </PrivateRoute>
                      }
                    />

                    <Route
                      path="/admin/users"
                      element={
                        <PrivateRoute roles={['admin']}>
                          <AdminUsers />
                        </PrivateRoute>
                      }
                    />

                    <Route
                      path="/admin/vendors"
                      element={
                        <PrivateRoute roles={['admin']}>
                          <AdminVendors />
                        </PrivateRoute>
                      }
                    />

                    <Route
                      path="/admin/products"
                      element={
                        <PrivateRoute roles={['admin']}>
                          <AdminProducts />
                        </PrivateRoute>
                      }
                    />
                  </Routes>
                </main>

                <Footer />

                <ToastContainer
                  position="top-right"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="colored"
                />
              </div>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;