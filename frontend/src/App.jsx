// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/user/profile';
import Products from './pages/admin/Products';
import UpdateProduct from './pages/admin/updateProduct';
import AdminDashboard from './pages/admin/AdminDashboard'; 

import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/AdminDashboard" element={<AdminDashboard />} /> 
          <Route path="/products" element={<Products />} />
          <Route path="/products/edit/:id" element={<UpdateProduct />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;