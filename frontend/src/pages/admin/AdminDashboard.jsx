import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  LogOut,
  TrendingUp,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Plus,
  Star,
  MessageCircle,
  X
} from 'lucide-react';
import Navbar from '../../components/layout/navbar';
import Footer from '../../components/layout/footer';
import ViewProductModal from './viewProduct';
import ViewOrderModal from './viewOrder';
import Overview from './Overview';
import api from '../../api/axios';

// Bulk Delete Modal Component
const BulkDeleteModal = ({ isOpen, onClose, onConfirm, selectedCount, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-full">
              <Trash2 className="text-red-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Confirm Delete</h3>
          </div>
          {!isDeleting && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          )}
        </div>

        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <span className="font-bold text-red-600">{selectedCount}</span> {selectedCount === 1 ? 'product' : 'products'}? This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={18} />
                Delete {selectedCount === 1 ? 'Product' : 'Products'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('overview');

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [selectedReviews, setSelectedReviews] = useState([]);

  // View modals
  const [viewProductId, setViewProductId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [viewOrderId, setViewOrderId] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Bulk delete products
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    totalSales: 0,
    orders: 0,
    products: 0,
    customers: 0
  });

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Auto-switch tab
  useEffect(() => {
    if (location.state?.openTab) {
      setActiveTab(location.state.openTab);
    }
  }, [location.state]);

  useEffect(() => {
    fetchDashboardData();
    fetchUsers();
    if (activeTab === "reviews") fetchReviews();
  }, [activeTab]);

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setCustomers(res.data);

      setStats(prev => ({ ...prev, customers: res.data.length }));
    } catch (err) {
      console.log("Fetch users error:", err);
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');

      const productsRes = await api.get("/products");
      setProducts(productsRes.data);

      const ordersRes = await api.get("/orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(ordersRes.data);

      const totalSales = ordersRes.data.reduce((sum, order) => sum + order.totalAmount, 0);

      setStats({
        totalSales,
        orders: ordersRes.data.length,
        products: productsRes.data.length,
        customers: stats.customers
      });
    } catch (err) {
      console.error("Dashboard error:", err);
    }
  };

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      const res = await api.get("/reviews");
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error("Fetch review error:", err);
    }
  };

  // Select all reviews
  const toggleSelectAllReviews = () => {
    if (selectedReviews.length === reviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(reviews.map(r => r._id));
    }
  };

  const toggleSelectReview = (id) => {
    setSelectedReviews(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Bulk delete reviews
  const handleBulkDeleteReviews = async () => {
    if (selectedReviews.length === 0) return;

    try {
      await api.post("/reviews/bulk-delete", { reviewIds: selectedReviews });

      setReviews(reviews.filter(r => !selectedReviews.includes(r._id)));
      setSelectedReviews([]);

      alert("Selected reviews deleted successfully.");
    } catch (err) {
      console.log("Error deleting reviews:", err);
    }
  };

  // Product selection
  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p._id));
    }
  };

  const handleDeleteClick = () => {
    if (selectedProducts.length === 0) {
      alert("Please select at least one product.");
      return;
    }
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await Promise.all(selectedProducts.map(id => api.delete(`/products/${id}`)));
      setSelectedProducts([]);
      setIsDeleteModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Order status update
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/orders/${orderId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrders(prev =>
        prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o)
      );
    } catch (err) {
      console.error("Order update error:", err);
    }
  };

  // User status toggle
  const toggleUserStatus = async (user) => {
    try {
      const updated = { isActive: !user.isActive };
      await api.put(`/users/${user._id}`, updated);

      setCustomers(prev =>
        prev.map(u => u._id === user._id ? { ...u, ...updated } : u)
      );
    } catch (err) {
      console.error("User update error:", err);
    }
  };

  // User role update
  const updateUserRole = async (id, role) => {
    try {
      await api.put(`/users/${id}`, { role });
      setCustomers(prev =>
        prev.map(u => u._id === id ? { ...u, role } : u)
      );
    } catch (err) {
      console.error("Role update error:", err);
    }
  };

  const getStatusColor = (status) => {
    const map = {
      delivered: 'bg-green-100 text-green-800',
      shipped: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-purple-100 text-purple-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return 'Out of Stock';
    if (stock < 10) return 'Low Stock';
    return 'In Stock';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* View Product Modal */}
      <ViewProductModal
        productId={viewProductId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <BulkDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        selectedCount={selectedProducts.length}
        isDeleting={isDeleting}
      />

      <ViewOrderModal
        orderId={viewOrderId}
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      />

      {/* DASHBOARD */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 mb-8 text-white">
          <h1 className="text-3xl font-bold">Admin Dashboard 👑</h1>
          <p>Welcome back, {user?.firstName}!</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {/* SIDEBAR */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mx-auto flex items-center justify-center text-3xl">
                  👑
                </div>
                <h3 className="font-bold">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-sm text-gray-500">Administrator</p>
              </div>

              <nav className="space-y-2">
                <button onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${
                    activeTab === 'overview' ? 'bg-purple-100 text-purple-600 font-semibold' : ''
                  }`}>
                  <LayoutDashboard size={20} /> Overview
                </button>

                <button onClick={() => setActiveTab('products')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${
                    activeTab === 'products' ? 'bg-purple-100 text-purple-600 font-semibold' : ''
                  }`}>
                  <Package size={20} /> Products
                </button>

                <button onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${
                    activeTab === 'orders' ? 'bg-purple-100 text-purple-600 font-semibold' : ''
                  }`}>
                  <ShoppingBag size={20} /> Orders
                </button>

                <button onClick={() => setActiveTab('customers')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${
                    activeTab === 'customers' ? 'bg-purple-100 text-purple-600 font-semibold' : ''
                  }`}>
                  <Users size={20} /> Customers
                </button>

                <button onClick={() => setActiveTab('reviews')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${
                    activeTab === 'reviews' ? 'bg-purple-100 text-purple-600 font-semibold' : ''
                  }`}>
                  <MessageCircle size={20} /> Reviews
                </button>

                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50">
                  <LogOut size={20} /> Logout
                </button>
              </nav>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="md:col-span-3">

            {/* OVERVIEW */}
            {activeTab === 'overview' && <Overview />}

            {/* PRODUCTS */}
            {activeTab === 'products' && (
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold">Products Management</h2>
                    {selectedProducts.length > 0 && (
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                        {selectedProducts.length} selected
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    {selectedProducts.length > 0 && (
                      <button
                        onClick={handleDeleteClick}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg flex gap-2"
                      >
                        <Trash2 size={18} /> Delete
                      </button>
                    )}

                    <button
                      onClick={() => navigate('/Products')}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg flex gap-2"
                    >
                      <Plus size={18} /> Add Product
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th>
                          <input
                            type="checkbox"
                            checked={selectedProducts.length === products.length}
                            onChange={toggleSelectAll}
                          />
                        </th>
                        <th className="py-3 text-left">Image</th>
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
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(p._id)}
                              onChange={() => toggleProductSelection(p._id)}
                            />
                          </td>

                          <td>
                            {p.images?.length > 0 ? (
                              <img src={p.images[0].url} className="w-16 h-16 rounded-lg object-cover" />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                            )}
                          </td>

                          <td>{p.name}</td>
                          <td>₱{p.price.toLocaleString()}</td>
                          <td>{p.stock}</td>

                          <td>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(getStockStatus(p.stock))}`}>
                              {getStockStatus(p.stock)}
                            </span>
                          </td>

                          <td className="flex gap-2 py-3">
                            <button
                              onClick={() => {
                                setViewProductId(p._id);
                                setIsModalOpen(true);
                              }}
                              className="text-blue-600"
                            >
                              <Eye size={18} />
                            </button>

                            <button
                              onClick={() => navigate(`/products/edit/${p._id}`)}
                              className="text-green-600"
                            >
                              <Edit size={18} />
                            </button>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ORDERS */}
            {activeTab === 'orders' && (
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6">All Orders</h2>

                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 text-left">Order ID</th>
                      <th className="py-3 text-left">Customer</th>
                      <th className="py-3 text-left">Date</th>
                      <th className="py-3 text-left">Amount</th>
                      <th className="py-3 text-left">Status</th>
                      <th className="py-3 text-left">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map(o => (
                      <tr key={o._id} className="border-b">
                        <td className="py-4 text-sm font-mono">{o._id.slice(-6)}</td>

                        <td className="py-4">
                          <div>
                            <p>{o.shippingAddress.firstName} {o.shippingAddress.lastName}</p>
                            <p className="text-sm text-gray-600">{o.shippingAddress.email}</p>
                          </div>
                        </td>

                        <td className="py-4">{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td className="py-4 font-semibold">₱{o.totalAmount.toLocaleString()}</td>

                        <td className="py-4">
                          <select
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                            className={`px-3 py-1 rounded-lg ${getStatusColor(o.status)}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>

                        <td>
                          <button
                            onClick={() => {
                              setViewOrderId(o._id);
                              setIsOrderModalOpen(true);
                            }}
                            className="text-pink-600"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            )}

            {/* CUSTOMERS */}
            {activeTab === 'customers' && (
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Customer List</h2>

                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 text-left">Name</th>
                      <th className="py-3 text-left">Email</th>
                      <th className="py-3 text-left">Role</th>
                      <th className="py-3 text-left">Status</th>
                      <th className="py-3 text-left">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {customers.map((c) => (
                      <tr key={c._id} className="border-b">
                        <td className="py-3">{c.firstName} {c.lastName}</td>
                        <td>{c.email}</td>

                        <td>
                          <select
                            value={c.role}
                            onChange={(e) => updateUserRole(c._id, e.target.value)}
                            className="border rounded-lg px-2 py-1"
                          >
                            <option value="customer">Customer</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>

                        <td>
                          <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                            c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {c.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="py-4">
                          <button
                            onClick={() => toggleUserStatus(c)}
                            className={`px-4 py-2 text-white rounded-lg ${
                              c.isActive ? "bg-red-600" : "bg-green-600"
                            }`}
                          >
                            {c.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            )}

            {/* REVIEWS */}
            {activeTab === "reviews" && (
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Product Reviews</h2>

                {selectedReviews.length > 0 && (
                  <button
                    onClick={handleBulkDeleteReviews}
                    className="mb-4 bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Trash2 size={18} /> Delete Selected ({selectedReviews.length})
                  </button>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedReviews.length === reviews.length}
                            onChange={toggleSelectAllReviews}
                          />
                        </th>
                        <th className="text-left py-3 font-semibold">User</th>
                        <th className="text-left py-3 font-semibold">Product</th>
                        <th className="text-left py-3 font-semibold">Rating</th>
                        <th className="text-left py-3 font-semibold">Comment</th>
                        <th className="text-left py-3 font-semibold">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {reviews.map((r) => (
                        <tr key={r._id} className="border-b hover:bg-gray-50 transition">
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedReviews.includes(r._id)}
                              onChange={() => toggleSelectReview(r._id)}
                            />
                          </td>

                          {/* USER */}
                          <td className="p-3">
                            <p className="font-medium">{r.userId?.firstName} {r.userId?.lastName}</p>
                            <p className="text-xs text-gray-500">{r.userId?.email}</p>
                          </td>

                          {/* PRODUCT */}
                          <td className="p-3">
                            <span className="font-medium">{r.productId?.name}</span>
                          </td>

                          {/* RATING */}
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  size={18}
                                  className={i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">{r.rating}/5</span>
                          </td>

                          {/* COMMENT */}
                          <td className="p-3 max-w-xs">
                            <p
                              className="text-gray-700 line-clamp-2"
                              title={r.comment} // hover shows full comment
                            >
                              {r.comment}
                            </p>
                          </td>

                          {/* ACTION */}
                          <td className="p-3">
                            <button
                              onClick={() => {
                                setSelectedReviews([r._id]);
                                handleBulkDeleteReviews();
                              }}
                              className="text-red-600 font-medium hover:underline"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
