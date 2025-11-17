// frontend/src/pages/user/checkout.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, Package, ShoppingCart, CheckCircle, Clock } from 'lucide-react';
import Navbar from '../../components/layout/navbar';
import Footer from '../../components/layout/footer';
import api from '../../api/axios';

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // ------------------------------------------------------
  // ⭐ AUTO-FILL EMAIL FROM LOGGED-IN USER
  // ------------------------------------------------------
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (savedUser?.email) {
      setFormData(prev => ({
        ...prev,
        email: savedUser.email
      }));
    }

    fetchCart(); 
  }, []);

  // ------------------------------------------------------
  const fetchCart = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/Login');
        return;
      }

      const response = await api.get('/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.length === 0) {
        navigate('/cart');
        return;
      }
      
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      if (error.response?.status === 401) {
        navigate('/Login');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = subtotal > 1000 ? 0 : 100;
    return subtotal + shipping;
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email';

    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) errors.phone = 'Invalid phone number';

    if (!formData.address.trim()) errors.address = 'Address is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert('Please fix the errors in the form');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');

      const orderResponse = await api.post(
        '/orders',
        {
          shippingAddress: formData,
          items: cart.map(item => ({
            productId: item.productId._id,
            quantity: item.quantity,
            price: item.productId.price,
            category: item.productId.category
          })),
          totalAmount: calculateTotal()
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setOrderId(orderResponse.data._id);
      setOrderPlaced(true);

      setTimeout(() => {
        navigate('/shop');
      }, 3000);

    } catch (error) {
      console.error('Error placing order:', error);
      alert(error.response?.data?.message || 'Error placing order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ------------------------------------------------------
  // LOADING SCREEN
  // ------------------------------------------------------
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

  // ------------------------------------------------------
  // ORDER SUCCESS SCREEN
  // ------------------------------------------------------
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar cartCount={0} wishlistCount={0} />

        <div className="max-w-2xl mx-auto px-4 py-20">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={48} className="text-green-600" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-3">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-2">Thank you for your order.</p>
            <p className="text-lg font-semibold text-pink-600 mb-8">Order ID: {orderId}</p>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <Clock className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Order Status: Pending</p>
                  <p className="text-sm text-gray-600 mt-1">
                    You will receive a confirmation email once your order is processed.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/shop')}
              className="px-8 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition font-semibold"
            >
              Continue Shopping
            </button>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // ------------------------------------------------------
  // MAIN CHECKOUT UI
  // ------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} 
        wishlistCount={0}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium mb-4"
          >
            <ArrowLeft size={20} />
            Back to Cart
          </button>
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingCart size={40} />
            Checkout
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* SHIPPING FORM */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin size={24} />
                Shipping Address
              </h2>

              <form onSubmit={handlePlaceOrder} className="space-y-6">

                {/* NAME */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      className={`w-full px-4 py-3 border rounded-lg ${
                        formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.firstName && <p className="text-red-600 text-sm">{formErrors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      className={`w-full px-4 py-3 border rounded-lg ${
                        formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.lastName && <p className="text-red-600 text-sm">{formErrors.lastName}</p>}
                  </div>
                </div>

                {/* EMAIL + PHONE */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Mail size={18} />
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className={`w-full px-4 py-3 border rounded-lg ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.email && <p className="text-red-600 text-sm">{formErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Phone size={18} />
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+63 9XX XXX XXXX"
                      className={`w-full px-4 py-3 border rounded-lg ${
                        formErrors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.phone && <p className="text-red-600 text-sm">{formErrors.phone}</p>}
                  </div>
                </div>

                {/* ADDRESS */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Street Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main Street, Apt 4B"
                    className={`w-full px-4 py-3 border rounded-lg ${
                      formErrors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.address && <p className="text-red-600 text-sm">{formErrors.address}</p>}
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Place Order'}
                </button>

              </form>
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Package size={24} />
                Order Summary
              </h2>

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.productId.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold">
                      ₱{(item.productId.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">₱{calculateSubtotal().toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold">
                    {calculateSubtotal() > 1000 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      '₱100'
                    )}
                  </span>
                </div>

                {calculateSubtotal() < 1000 && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    Add ₱{(1000 - calculateSubtotal()).toLocaleString()} more for free shipping!
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-pink-600">₱{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
