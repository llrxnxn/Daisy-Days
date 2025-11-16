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
  X
} from 'lucide-react';
import Navbar from '../../components/layout/navbar';
import Footer from '../../components/layout/footer';
import ViewProductModal from './viewProduct';
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

  // ✅ View Modal state
  const [viewProductId, setViewProductId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ Bulk Delete state
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // AUTO SWITCH TAB BASED ON NAVIGATE STATE
  useEffect(() => {
    if (location.state?.openTab) {
      setActiveTab(location.state.openTab);
    }
  }, [location.state]);

  // Actual Data
  const [stats, setStats] = useState({
    totalSales: 0,
    orders: 0,
    products: 0,
    customers: 0
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
  const fetchAllData = async () => {
    try {
      await fetchDashboardData();
      await fetchUsers();
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    }
  };
  fetchAllData();
}, []);

  
  const fetchUsers = async () => {
  try {
    const res = await api.get("/users");
    setCustomers(res.data);

    // update customer stats
    setStats(prev => ({ ...prev, customers: res.data.length }));
  } catch (err) {
    console.log("Fetch users error:", err);
  }
};

  const fetchDashboardData = async () => {
    try {
      const productsRes = await api.get("/products");
      setProducts(productsRes.data);

      setStats({
        totalSales: 0,
        orders: 0,
        products: productsRes.data.length,
        customers: 0
      });

    } catch (err) {
      console.error("Dashboard error:", err);
      alert("Error loading dashboard data: " + err.message);
    }
  };

  // ✅ Toggle individual product selection
  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // ✅ Toggle user active/inactive status
  const toggleUserStatus = async (c) => {
  try {
    const updated = { isActive: !c.isActive };

    await api.put(`/users/${c._id}`, updated);

    // update local UI without reloading everything
    setCustomers(prev =>
      prev.map(u => u._id === c._id ? { ...u, ...updated } : u)
    );
    
    alert(updated.isActive ? "User account activated" : "User account deactivated. They won't be able to login until reactivated.");
  } catch (err) {
    console.error("Update status error:", err);
    alert("Failed to update user status");
  }
};

  // ✅ Update user role
  const updateUserRole = async (userId, newRole) => {
  try {
    await api.put(`/users/${userId}`, { role: newRole });

    // update local UI without reloading everything
    setCustomers(prev =>
      prev.map(u => u._id === userId ? { ...u, role: newRole } : u)
    );
    
    alert(`User role updated to ${newRole}`);
  } catch (err) {
    console.error("Update role error:", err);
    alert("Failed to update user role");
  }
};

  // ✅ Toggle select all products
  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p._id));
    }
  };

  // ✅ Open delete modal
  const handleDeleteClick = () => {
    if (selectedProducts.length === 0) {
      alert("Please select at least one product to delete");
      return;
    }
    setIsDeleteModalOpen(true);
  };

  // ✅ Close delete modal
  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setIsDeleteModalOpen(false);
    }
  };

  // ✅ Confirm bulk delete
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      // Delete all selected products
      await Promise.all(
        selectedProducts.map(id => api.delete(`/products/${id}`))
      );
      
      setIsDeleteModalOpen(false);
      alert(`${selectedProducts.length} product(s) deleted successfully!`);
      setSelectedProducts([]);
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert("Error deleting products: " + (err.response?.data?.message || err.message));
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ Open view modal
  const handleViewProduct = (productId) => {
    setViewProductId(productId);
    setIsModalOpen(true);
  };

  // ✅ Close view modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setViewProductId(null);
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

  const getStockStatus = (stock) => {
    if (stock === 0) return 'Out of Stock';
    if (stock < 10) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* ✅ View Product Modal */}
      <ViewProductModal
        productId={viewProductId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* ✅ Bulk Delete Confirmation Modal */}
      <BulkDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        selectedCount={selectedProducts.length}
        isDeleting={isDeleting}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
       
        {/* HEADER */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard 👑</h1>
              <p className="text-purple-100">Welcome back, {user?.firstName}!</p>
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
            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <Overview />
            )}

            {/* PRODUCTS */}
            {activeTab === "products" && (
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-900">Products Management</h2>
                    {selectedProducts.length > 0 && (
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {selectedProducts.length} selected
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {selectedProducts.length > 0 && (
                      <button
                        onClick={handleDeleteClick}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                      >
                        <Trash2 size={20} />
                        Delete ({selectedProducts.length})
                      </button>
                    )}
                    <button
                      onClick={() => navigate('/Products')}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
                    >
                      <Plus size={20} />
                      Add Product
                    </button>
                  </div>
                </div>

                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <Package size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No products yet. Add your first product!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 text-left w-12">
                            <input
                              type="checkbox"
                              checked={selectedProducts.length === products.length && products.length > 0}
                              onChange={toggleSelectAll}
                              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
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
                          <tr 
                            key={p._id} 
                            className={`border-b hover:bg-gray-50 transition ${
                              selectedProducts.includes(p._id) ? 'bg-purple-50' : ''
                            }`}
                          >
                            <td className="py-4">
                              <input
                                type="checkbox"
                                checked={selectedProducts.includes(p._id)}
                                onChange={() => toggleProductSelection(p._id)}
                                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                              />
                            </td>
                            <td className="py-4">
                              {p.images && p.images.length > 0 ? (
                                <img 
                                  src={p.images[0].url} 
                                  alt={p.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <Package size={24} className="text-gray-400" />
                                </div>
                              )}
                            </td>
                            <td className="py-4 font-medium">{p.name}</td>
                            <td className="py-4">₱{p.price.toLocaleString()}</td>
                            <td className="py-4">{p.stock}</td>
                            <td className="py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(getStockStatus(p.stock))}`}>
                                {getStockStatus(p.stock)}
                              </span>
                            </td>
                            <td className="py-4 flex gap-2">
                              <button 
                                onClick={() => handleViewProduct(p._id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="View Product"
                              >
                                <Eye size={18} />
                              </button>
                              <button 
                                onClick={() => navigate(`/products/edit/${p._id}`)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                title="Edit Product"
                              >
                                <Edit size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ORDERS */}
            {activeTab === "orders" && (
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6">All Orders</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No orders yet.</p>
                  </div>
                ) : (
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
                )}
              </div>
            )}

            {/* CUSTOMERS */}
            {activeTab === "customers" && (
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Customer List</h2>
                {customers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No customers yet.</p>
                  </div>
                ) : (
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
                      <tr key={c._id} className="border-b hover:bg-gray-50">
                        <td className="py-4">{c.firstName} {c.lastName}</td>
                        <td className="py-4">{c.email}</td>
                        <td className="py-4">
                          <select
                            value={c.role}
                            onChange={(e) => updateUserRole(c._id, e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm capitalize focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="customer">Customer</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="py-4">
                          <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                            c.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {c.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-4 flex gap-2">
                          <button
                            onClick={() => toggleUserStatus(c)}
                            className={`px-4 py-2 text-white rounded-lg font-medium transition ${
                              c.isActive 
                                ? "bg-red-600 hover:bg-red-700" 
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                          >
                            {c.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}