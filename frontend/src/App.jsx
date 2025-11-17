// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Shop from './pages/user/shop';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/user/profile';
import Cart from './pages/user/cart';
import Checkout from './pages/user/checkout';
import Orders from './pages/user/orders';
import TransactionHistory from './pages/user/transactionHistory';
import Wishlist from './pages/user/wishlist';
import ViewProduct from './pages/user/viewProduct';
import Products from './pages/admin/Products';
import UpdateProduct from './pages/admin/updateProduct';
import AdminDashboard from './pages/admin/AdminDashboard';
import ReviewPage from "./pages/user/ReviewPage";

import { WishlistProvider } from './context/WishlistContext';
import ProtectedRoute from "./components/routes/ProtectedRoute";

import './index.css';

function App() {
  return (
    <WishlistProvider>
      <Router>
        <div className="App">
          <Routes>

            {/* PUBLIC ROUTES */}
            <Route path="/" element={<Home />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* CUSTOMER PROTECTED ROUTES */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/shop"
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <Shop />
                </ProtectedRoute>
              }
            />

            <Route
              path="/wishlist"
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <Wishlist />
                </ProtectedRoute>
              }
            />

            <Route
              path="/product/:id"
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <ViewProduct />
                </ProtectedRoute>
              }
            />

            <Route
              path="/review/:id"
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <ReviewPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/cart"
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <Cart />
                </ProtectedRoute>
              }
            />

            <Route
              path="/checkout"
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <Checkout />
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders"
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <Orders />
                </ProtectedRoute>
              }
            />

            <Route
              path="/transactions"
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <TransactionHistory />
                </ProtectedRoute>
              }
            />

            {/* ADMIN PROTECTED ROUTES */}
            <Route
              path="/AdminDashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/products"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Products />
                </ProtectedRoute>
              }
            />

            <Route
              path="/products/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <UpdateProduct />
                </ProtectedRoute>
              }
            />

          </Routes>
        </div>
      </Router>
    </WishlistProvider>
  );
}

export default App;
