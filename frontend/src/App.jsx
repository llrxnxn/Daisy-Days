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
import { WishlistProvider } from './context/WishlistContext';
import ReviewPage from "./pages/user/ReviewPage"; // make sure this import exists

import './index.css';

function App() {
  return (
    <WishlistProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/AdminDashboard" element={<AdminDashboard />} /> 
            <Route path="/products" element={<Products />} />
            <Route path="/products/edit/:id" element={<UpdateProduct />} />
            <Route path="/product/:id" element={<ViewProduct />} />
            <Route path="/review/:id" element={<ReviewPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/transactions" element={<TransactionHistory />} />
          </Routes>
        </div>
      </Router>
    </WishlistProvider>
  );
}

export default App;