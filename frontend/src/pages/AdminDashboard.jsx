// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  TrendingUp,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import Navbar from '../components/layout/navbar';
import Footer from '../components/layout/footer';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const stats = [
    { label: 'Total Sales', value: '₱125,340', change: '+12.5%', icon: DollarSign, color: 'bg-green-500' },
    { label: 'Orders', value: '234', change: '+8.2%', icon: ShoppingBag, color: 'bg-blue-500' },
    { label: 'Products', value: '103', change: '+3', icon: Package, color: 'bg-purple-500' },
    { label: 'Customers', value: '1,482', change: '+24', icon: Users, color: 'bg-pink-500' }
  ];

  const recentOrders = [
    { id: 'ORD-001', customer: 'John Doe', product: 'Rose Bouquet', amount: 1299, status: 'Processing' },
    { id: 'ORD-002', customer: 'Jane Smith', product: 'Lily Elegance', amount: 1499, status: 'Shipped' },
    { id: 'ORD-003', customer: 'Mike Johnson', product: 'Tulip Paradise', amount: 1099, status: 'Delivered' },
    { id: 'ORD-004', customer: 'Sarah Williams', product: 'Sunflower Sunshine', amount: 899, status: 'Pending' }
  ];

  const products = [
    { id: 1, name: 'Rose Bouquet Deluxe', category: 'Bouquets', price: 1299, stock: 45, status: 'In Stock' },
    { id: 2, name: 'Sunflower Sunshine', category: 'Single Stems', price: 899, stock: 32, status: 'In Stock' },
    { id: 3, name: 'Lily Elegance', category: 'Arrangements', price: 1499, stock: 5, status: 'Low Stock' },
    { id: 4, name: 'Tulip Paradise', category: 'Bouquets', price: 1099, stock: 0, status: 'Out of Stock' }
  ];

  const customers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', orders: 12, spent: 15588, joined: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', orders: 8, spent: 11992, joined: '2024-02-20' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', orders: 5, spent: 6495, joined: '2024-03-10' },
    { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', orders: 15, spent: 19485, joined: '2024-01-05' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Stock':
        return 'bg-green-100 text-green-800';
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard 👑</h1>
              <p className="text-purple-100">Welcome back, {user?.firstName}! Manage your store here.</p>
            </div>
            <div className="hidden md:block">
              <div className="text-right">
                <div className="text-sm text-purple-100">Total Revenue</div>
                <div className="text-4xl font-bold">₱125,340</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">👑</span>
                </div>
                <h3 className="font-bold text-lg text-gray-900">{user?.firstName} {user?.lastName}</h3>
                <p className="text-sm text-gray-500">Administrator</p>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    activeTab === 'overview' ? 'bg-purple-100 text-purple-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <LayoutDashboard size={20} />
                  <span>Overview</span>
                </button>

                <button
                  onClick={() => setActiveTab('products')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    activeTab === 'products' ? 'bg-purple-100 text-purple-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Package size={20} />
                  <span>Products</span>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    activeTab === 'orders' ? 'bg-purple-100 text-purple-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ShoppingBag size={20} />
                  <span>Orders</span>
                </button>

                <button
                  onClick={() => setActiveTab('customers')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    activeTab === 'customers' ? 'bg-purple-100 text-purple-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Users size={20} />
                  <span>Customers</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    activeTab === 'settings' ? 'bg-purple-100 text-purple-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Settings size={20} />
                  <span>Settings</span>
                </button>

                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition">
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-2xl shadow-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`${stat.color} p-3 rounded-xl`}>
                          <stat.icon className="text-white" size={24} />
                        </div>
                        <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
                          <TrendingUp size={16} />
                          {stat.change}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Orders</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4 font-semibold text-gray-900">{order.id}</td>
                            <td className="py-4 px-4 text-gray-600">{order.customer}</td>
                            <td className="py-4 px-4 text-gray-600">{order.product}</td>
                            <td className="py-4 px-4 font-semibold text-gray-900">₱{order.amount}</td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Products Management</h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition">
                    <Plus size={20} />
                    Add Product
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Stock</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 font-semibold text-gray-900">{product.name}</td>
                          <td className="py-4 px-4 text-gray-600">{product.category}</td>
                          <td className="py-4 px-4 font-semibold text-gray-900">₱{product.price}</td>
                          <td className="py-4 px-4 text-gray-600">{product.stock}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(product.status)}`}>
                              {product.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                <Eye size={18} />
                              </button>
                              <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition">
                                <Edit size={18} />
                              </button>
                              <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">All Orders</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 font-semibold text-gray-900">{order.id}</td>
                          <td className="py-4 px-4 text-gray-600">{order.customer}</td>
                          <td className="py-4 px-4 text-gray-600">{order.product}</td>
                          <td className="py-4 px-4 font-semibold text-gray-900">₱{order.amount}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Customers Tab */}
            {activeTab === 'customers' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Management</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Orders</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Spent</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 font-semibold text-gray-900">{customer.name}</td>
                          <td className="py-4 px-4 text-gray-600">{customer.email}</td>
                          <td className="py-4 px-4 text-gray-600">{customer.orders}</td>
                          <td className="py-4 px-4 font-semibold text-gray-900">₱{customer.spent}</td>
                          <td className="py-4 px-4 text-gray-600">{customer.joined}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Store Settings</h2>
                <div className="space-y-6">
                  <div className="border-2 border-gray-200 rounded-xl p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-4">Store Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Store Name</label>
                        <input type="text" value="Daisy Days" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Email</label>
                        <input type="email" value="hello@daisydays.ph" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" />
                      </div>
                      <button className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}