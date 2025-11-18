// frontend/src/pages/user/transactionHistory.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Calendar, MapPin, DollarSign, Search, Filter, Download, ChevronDown, CheckCircle, Clock, Truck } from 'lucide-react';
import Navbar from '../../components/layout/navbar';
import Footer from '../../components/layout/footer';
import api from '../../api/axios';

export default function TransactionHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [reviewStatus, setReviewStatus] = useState({}); // FIXED: Added missing state

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      checkReviewStatus();
    }
  }, [orders]);

  const checkReviewStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const deliveredOrders = orders.filter(o => o.status === 'delivered');
      const statusMap = {};

      for (const order of deliveredOrders) {
        let hasReview = false;
        for (const item of order.items) {
          try {
            const res = await api.get(`/reviews/check/${item.productId._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.hasReview) {
              hasReview = true;
              break; // Mark order as having at least one review
            }
          } catch (error) {
            console.error(`Error checking review for product ${item.productId._id}:`, error);
          }
        }
        if (hasReview) {
          statusMap[order._id] = true;
        }
      }

      setReviewStatus(statusMap);
    } catch (error) {
      console.error('Error checking review status:', error);
    }
  };
const handleCancelOrder = async (orderId) => {
  if (!window.confirm('Are you sure you want to cancel this order? You will receive a refund.')) {
    return;
  }

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to cancel orders');
      return;
    }

    console.log('Attempting to cancel order:', orderId);
    console.log('Token exists:', !!token);

    // Call DELETE endpoint to cancel the order
    const response = await api.delete(`/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Cancel response:', response);

    // Update the local orders state
    setOrders(orders.map(order =>
      order._id === orderId
        ? { ...order, status: 'cancelled', updatedAt: new Date() }
        : order
    ));

    setExpandedOrder(null);
    alert('Order cancelled successfully. Your refund will be processed shortly.');

  } catch (error) {
    console.error('Full error object:', error);
    console.error('Error response data:', error.response?.data);
    console.error('Error response status:', error.response?.status);
    console.error('Error message:', error.message);
    console.error('Error config:', error.config);
    
    // Show detailed error message
    const errorMessage = error.response?.data?.message || error.message || 'Failed to cancel order';
    alert(`Error: ${errorMessage}`);
  }
};

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/Login');
        return;
      }

      const response = await api.get('/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 401) {
        navigate('/Login');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'confirmed':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle size={18} className="text-green-600" />;
      case 'shipped':
        return <Truck size={18} className="text-blue-600" />;
      case 'confirmed':
        return <Package size={18} className="text-purple-600" />;
      case 'pending':
        return <Clock size={18} className="text-yellow-600" />;
      case 'cancelled':
        return <span className="text-red-600 font-bold">✕</span>;
      default:
        return <Package size={18} className="text-gray-600" />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter and search orders
  let processedOrders = orders.filter(order => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesSearch = 
      searchQuery === '' ||
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shippingAddress?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shippingAddress?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.totalAmount.toString().includes(searchQuery);
    
    return matchesStatus && matchesSearch;
  });

  // Sort orders
  if (sortBy === 'recent') {
    processedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortBy === 'oldest') {
    processedOrders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sortBy === 'highestPrice') {
    processedOrders.sort((a, b) => b.totalAmount - a.totalAmount);
  } else if (sortBy === 'lowestPrice') {
    processedOrders.sort((a, b) => a.totalAmount - b.totalAmount);
  }

  // Calculate statistics
  const stats = {
    totalOrders: orders.length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    pending: orders.filter(o => o.status === 'pending').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar cartCount={0} wishlistCount={0} />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar cartCount={0} wishlistCount={0} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Package size={40} className="text-pink-600" />
            <h1 className="text-4xl font-bold text-gray-900">Transaction History</h1>
          </div>
          <p className="text-gray-600">View and manage all your orders in one place</p>
        </div>

        {/* Statistics Cards */}
        {orders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-pink-600 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
                </div>
                <Package size={32} className="text-pink-200" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-600 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Delivered</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.delivered}</p>
                </div>
                <CheckCircle size={32} className="text-green-200" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-600 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
                </div>
                <Clock size={32} className="text-yellow-200" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">In Transit</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{stats.shipped}</p>
                </div>
                <Truck size={32} className="text-blue-200" />
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by Order ID, Name, or Amount..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 transition"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 bg-white transition"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="highestPrice">Highest Price</option>
              <option value="lowestPrice">Lowest Price</option>
            </select>
          </div>

          {/* Status Filter Tags */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-full font-medium transition capitalize ${
                  selectedStatus === status
                    ? 'bg-pink-600 text-white shadow-lg scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status === 'all' ? '📦 All Orders' : `${status}`}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {processedOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'No orders match your search'
                : selectedStatus === 'all'
                ? 'You haven\'t placed any orders yet'
                : `No orders with status "${selectedStatus}"`
              }
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition inline-flex items-center gap-2"
            >
              <Package size={20} />
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {processedOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition border border-gray-200"
              >
                {/* Order Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <div className="bg-gradient-to-br from-pink-100 to-pink-50 px-3 py-1 rounded-lg border border-pink-200">
                          <p className="font-bold text-pink-700 text-sm">#{order._id.slice(-8).toUpperCase()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize border flex items-center gap-1 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)} {order.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-600 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Calendar size={16} className="text-gray-400" />
                          <span>{formatDateShort(order.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Package size={16} className="text-gray-400" />
                          <span>{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={16} className="text-gray-400" />
                          <span>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-pink-600 mb-2">
                        ₱{order.totalAmount.toLocaleString()}
                      </p>
                      <ChevronDown
                        size={24}
                        className={`text-pink-600 transition ml-auto ${
                          expandedOrder === order._id ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Order Details (Expanded) */}
                {expandedOrder === order._id && (
                  <div className="border-t bg-gray-50 px-6 py-6 space-y-6">
                    {/* Items */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Package size={18} className="text-pink-600" />
                        Order Items ({order.items.length})
                      </h4>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-pink-300 transition">
                            {item.productId?.images && item.productId.images.length > 0 && (
                              <img
                                src={item.productId.images[0].url}
                                alt={item.productId.name}
                                className="w-20 h-20 object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=200&h=200&fit=crop';
                                }}
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{item.productId?.name}</p>
                              <p className="text-sm text-gray-600">{item.productId?.category}</p>
                              <p className="text-sm text-gray-600 mt-2">
                                <span className="bg-gray-100 px-2 py-1 rounded">Qty: {item.quantity}</span>
                                <span className="ml-2">@ ₱{item.price.toLocaleString()}</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">
                                ₱{(item.price * item.quantity).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {item.quantity} × ₱{item.price.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <MapPin size={18} className="text-pink-600" />
                          Shipping Address
                        </h4>
                        <div className="bg-white border border-gray-200 p-4 rounded-lg space-y-2">
                          <p className="font-medium text-gray-900">
                            {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{order.shippingAddress?.address}</p>
                          <p className="text-sm text-gray-600">
                            {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                          </p>
                          <div className="border-t pt-3 mt-3 space-y-1">
                            <p className="text-sm text-gray-600">
                              <strong>Email:</strong> {order.shippingAddress?.email}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Phone:</strong> {order.shippingAddress?.phone}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <DollarSign size={18} className="text-pink-600" />
                          Order Summary
                        </h4>
                        <div className="bg-white border border-gray-200 p-4 rounded-lg space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-semibold text-gray-900">
                              ₱{order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Shipping:</span>
                            <span className="font-semibold">
                              {order.totalAmount > 1000 ? (
                                <span className="text-green-600">FREE</span>
                              ) : (
                                <span className="text-gray-900">₱100</span>
                              )}
                            </span>
                          </div>
                          <div className="border-t pt-3 flex justify-between text-lg">
                            <span className="font-bold text-gray-900">Total:</span>
                            <span className="font-bold text-pink-600">₱{order.totalAmount.toLocaleString()}</span>
                          </div>
                          <div className="pt-3 border-t space-y-1 text-xs text-gray-500">
                            <p><strong>Placed:</strong> {formatDate(order.createdAt)}</p>
                            {order.status === 'delivered' && order.updatedAt && (
                              <p><strong>Delivered:</strong> {formatDate(order.updatedAt)}</p>
                            )}
                            {order.status === 'shipped' && order.updatedAt && (
                              <p><strong>Shipped:</strong> {formatDate(order.updatedAt)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">Order Status Timeline</h4>
                      <div className="space-y-2">
                        {['pending', 'confirmed', 'shipped', 'delivered'].map((status, index) => (
                          <div key={status} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                              ['pending', 'confirmed', 'shipped', 'delivered'].indexOf(order.status) >= index
                                ? 'bg-green-500'
                                : 'bg-gray-300'
                            }`}>
                              ✓
                            </div>
                            <span className={`capitalize ${
                              ['pending', 'confirmed', 'shipped', 'delivered'].indexOf(order.status) >= index
                                ? 'text-gray-900 font-semibold'
                                : 'text-gray-500'
                            }`}>
                              {status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 flex-wrap">
                      <button
                        onClick={() => navigate('/shop')}
                        className="flex-1 min-w-40 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition font-semibold"
                      >
                        Buy Again
                      </button>
                      {['pending', 'confirmed'].includes(order.status) && (
                        <button onClick={() => handleCancelOrder(order._id)} className="flex-1 min-w-40 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-semibold">
                          Cancel Order
                        </button>
                      )}
                      {order.status === 'delivered' ? (
                        <button
                          onClick={() => navigate(`/review/${order._id}`)}
                          className="flex-1 min-w-40 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 transition"
                          title={reviewStatus[order._id] ? 'You can update your review' : 'Write a review for this order'}
                        >
                          {reviewStatus[order._id] ? '✏️ Update Review' : '⭐ Write a Review'}
                        </button>
                      ) : (
                        <button
                          disabled
                          className="flex-1 min-w-40 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 bg-gray-200 text-gray-500 cursor-not-allowed"
                          title="You can only review delivered orders"
                        >
                          ⭐ Write a Review
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Results Info */}
        {processedOrders.length > 0 && (
          <div className="mt-8 text-center text-gray-600 pb-8">
            <p>Showing {processedOrders.length} of {orders.length} order{orders.length > 1 ? 's' : ''}</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}