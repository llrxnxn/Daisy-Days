// frontend/src/pages/user/orders.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowRight, Calendar, MapPin, DollarSign, AlertCircle, Loader, Search, Filter, Download, ChevronDown } from 'lucide-react';
import Navbar from '../../components/layout/navbar';
import Footer from '../../components/layout/footer';
import api from '../../api/axios';

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

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
        return '✓';
      case 'shipped':
        return '🚚';
      case 'confirmed':
        return '✔';
      case 'pending':
        return '⏳';
      case 'cancelled':
        return '✕';
      default:
        return '?';
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
    totalSpent: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    delivered: orders.filter(o => o.status === 'delivered').length,
    pending: orders.filter(o => o.status === 'pending').length,
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
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={0} wishlistCount={0} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Package size={40} />
            My Orders
          </h1>
          <p className="text-gray-600">
            {filteredOrders.length === 0
              ? 'You haven\'t placed any orders yet'
              : `You have ${filteredOrders.length} order${filteredOrders.length > 1 ? 's' : ''}`
            }
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                selectedStatus === status
                  ? 'bg-pink-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-600 mb-6">
              {selectedStatus === 'all'
                ? 'Start shopping to place your first order!'
                : `No orders with status "${selectedStatus}"`
              }
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition inline-flex items-center gap-2"
            >
              <Package size={20} />
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
                {/* Order Header */}
                <div
                  className="p-6 bg-gradient-to-r from-pink-50 to-white cursor-pointer hover:bg-pink-100 transition"
                  onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-bold text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          {formatDate(order.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Package size={16} />
                          {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-pink-600">
                        ₱{order.totalAmount.toLocaleString()}
                      </p>
                      <ArrowRight
                        size={24}
                        className={`text-pink-600 transition ml-auto ${
                          expandedOrder === order._id ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Order Details (Expanded) */}
                {expandedOrder === order._id && (
                  <div className="border-t px-6 py-6 space-y-6">
                    {/* Items */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-4">Order Items</h4>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                            {item.productId.images && item.productId.images.length > 0 && (
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
                              <p className="font-semibold text-gray-900">{item.productId.name}</p>
                              <p className="text-sm text-gray-600">{item.productId.category}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                Qty: {item.quantity} × ₱{item.price.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">
                                ₱{(item.price * item.quantity).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <MapPin size={18} />
                        Shipping Address
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-medium text-gray-900">
                          {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{order.shippingAddress.address}</p>
                        <p className="text-sm text-gray-600">
                          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Email:</strong> {order.shippingAddress.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Phone:</strong> {order.shippingAddress.phone}
                        </p>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-semibold">
                          ₱{(order.totalAmount - (order.totalAmount > 1000 ? 0 : 100)).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping:</span>
                        <span className="font-semibold">
                          {order.totalAmount > 1000 ? (
                            <span className="text-green-600">FREE</span>
                          ) : (
                            '₱100'
                          )}
                        </span>
                      </div>
                      <div className="border-t pt-2 flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-pink-600">₱{order.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate('/shop')}
                        className="flex-1 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition font-semibold"
                      >
                        Continue Shopping
                      </button>
                      {['pending', 'confirmed'].includes(order.status) && (
                        <button className="flex-1 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition font-semibold">
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
