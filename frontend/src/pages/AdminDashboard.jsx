import React, { useState, useEffect } from 'react';
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

// import api from "../api/axios";
import Navbar from '../components/layout/navbar';
import Footer from '../components/layout/footer';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Actual Data (no more mock)
  const [stats, setStats] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);

  // DATA FETCHING
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await api.get("/admin/stats");
      const productsRes = await api.get("/products");
      const ordersRes = await api.get("/orders");
      const customersRes = await api.get("/customers");

      setStats(statsRes.data);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
      setCustomers(customersRes.data);
    } catch (err) {
      console.error("Dashboard error:", err);
    }
  };

  // PRODUCT DELETE
  const handleDeleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await api.delete(`/products/${id}`);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Shipped': return 'bg-purple-100 text-purple-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard 👑</h1>
              <p className="text-purple-100">Welcome back, {user?.firstName}!</p>
            </div>

            <div className="hidden md:block text-right">
              <div className="text-sm text-purple-100">Total Revenue</div>
              <div className="text-4xl font-bold">
                ₱{stats?.totalSales?.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-8">

          {/* SIDEBAR */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">

              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl">👑</span>
                </div>
                <h3 className="font-bold text-lg text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-sm text-gray-500">Administrator</p>
              </div>

              <nav className="space-y-2">

                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    activeTab === 'overview'
                      ? 'bg-purple-100 text-purple-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <LayoutDashboard size={20} /> <span>Overview</span>
                </button>

                <button
                  onClick={() => setActiveTab('products')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    activeTab === 'products'
                      ? 'bg-purple-100 text-purple-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Package size={20} /> <span>Products</span>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    activeTab === 'orders'
                      ? 'bg-purple-100 text-purple-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ShoppingBag size={20} /> <span>Orders</span>
                </button>

                <button
                  onClick={() => setActiveTab('customers')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    activeTab === 'customers'
                      ? 'bg-purple-100 text-purple-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Users size={20} /> <span>Customers</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    activeTab === 'settings'
                      ? 'bg-purple-100 text-purple-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Settings size={20} /> <span>Settings</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>

              </nav>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="md:col-span-3">

            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-8">

                {/* Stats */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

                  <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between mb-4">
                      <div className="bg-green-500 p-3 rounded-xl">
                        <DollarSign className="text-white" />
                      </div>
                      <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
                        <TrendingUp size={16} /> +12%
                      </span>
                    </div>
                    <div className="text-2xl font-bold">
                      ₱{stats?.totalSales?.toLocaleString()}
                    </div>
                    <div className="text-gray-500 text-sm">Total Sales</div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between mb-4">
                      <div className="bg-blue-500 p-3 rounded-xl">
                        <ShoppingBag className="text-white" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold">{stats.orders}</div>
                    <div className="text-gray-500 text-sm">Orders</div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between mb-4">
                      <div className="bg-purple-500 p-3 rounded-xl">
                        <Package className="text-white" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold">{stats.products}</div>
                    <div className="text-gray-500 text-sm">Products</div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between mb-4">
                      <div className="bg-pink-500 p-3 rounded-xl">
                        <Users className="text-white" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold">{stats.customers}</div>
                    <div className="text-gray-500 text-sm">Customers</div>
                  </div>

                </div>

              </div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === "products" && (
              <div className="bg-white p-8 rounded-2xl shadow-lg">
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
                      <tr className="border-b">
                        <th className="py-3 text-left">Name</th>
                        <th className="py-3 text-left">Price</th>
                        <th className="py-3 text-left">Stock</th>
                        <th className="py-3 text-left">Status</th>
                        <th className="py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p._id} className="border-b hover:bg-gray-50">
                          <td className="py-4">{p.name}</td>
                          <td className="py-4">₱{p.price}</td>
                          <td className="py-4">{p.stock}</td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(p.status)}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="py-4 flex gap-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                              <Eye size={18} />
                            </button>
                            <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6">All Orders</h2>

                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 text-left">Order ID</th>
                      <th className="py-3 text-left">Customer</th>
                      <th className="py-3 text-left">Amount</th>
                      <th className="py-3 text-left">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((o) => (
                      <tr key={o._id} className="border-b hover:bg-gray-50">
                        <td className="py-4">{o._id}</td>
                        <td className="py-4">{o.customerName}</td>
                        <td className="py-4">₱{o.amount}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(o.status)}`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

              </div>
            )}

            {/* CUSTOMERS TAB */}
            {activeTab === "customers" && (
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Customer List</h2>

                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 text-left">Name</th>
                      <th className="py-3 text-left">Email</th>
                      <th className="py-3 text-left">Orders</th>
                    </tr>
                  </thead>

                  <tbody>
                    {customers.map((c) => (
                      <tr key={c._id} className="border-b hover:bg-gray-50">
                        <td className="py-4">{c.firstName} {c.lastName}</td>
                        <td className="py-4">{c.email}</td>
                        <td className="py-4">{c.orderCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

              </div>
            )}

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
