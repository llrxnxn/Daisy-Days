import React, { useState, useEffect } from 'react';
import { X, Package, MapPin, DollarSign, Clock, User, Mail, Phone } from 'lucide-react';
import api from '../../api/axios';

export default function ViewOrderModal({ orderId, isOpen, onClose }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
    }
  }, [isOpen, orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setOrder(response.data);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(err.response?.data?.message || 'Error fetching order details');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-96 overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-pink-50 to-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : order ? (
            <div className="space-y-6">
              {/* Order Header Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Order ID</p>
                  <p className="font-mono font-semibold text-gray-900">{order._id.slice(-12).toUpperCase()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Order Date</p>
                  <p className="font-semibold text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Package size={20} />
                  Order Items
                </h3>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start pb-3 border-b last:border-b-0">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.productId.name}</p>
                        <p className="text-sm text-gray-600">{item.productId.category}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900 ml-4">₱{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin size={20} />
                  Shipping Address
                </h3>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="font-semibold text-gray-900">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  <p className="text-gray-700 mt-2">{order.shippingAddress.address}</p>
                  <p className="text-gray-700">
                    {order.shippingAddress.city}, {order.shippingAddress.state}
                  </p>
                  
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-blue-600" />
                      <span>{order.shippingAddress.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-blue-600" />
                      <span>{order.shippingAddress.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span>₱{(order.totalAmount - (order.totalAmount > 1000 ? 0 : 100)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping:</span>
                    <span>{order.totalAmount > 1000 ? <span className="text-green-600 font-medium">FREE</span> : '₱100'}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total:</span>
                    <span className="text-pink-600">₱{order.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-600 mb-2">Order Status</p>
                <p className="font-semibold text-gray-900 capitalize">{order.status}</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
