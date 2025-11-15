// frontend/src/pages/user/cart.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, Heart, ArrowRight, Package, ShoppingBag } from 'lucide-react';
import Navbar from '../../components/layout/navbar';
import Footer from '../../components/layout/footer';
import api from '../../api/axios';

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    fetchCart();
    fetchWishlist();
  }, []);

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

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await api.get('/wishlist', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setWishlist(response.data.map(item => item.productId || item._id));
    } catch (error) {
      console.log('Wishlist not available');
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await api.put(`/cart/${itemId}`, 
        { quantity: newQuantity },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setCart(cart.map(item => 
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Error updating quantity');
    } finally {
      setUpdating(false);
    }
  };

  const removeFromCart = async (itemId) => {
    if (!window.confirm('Remove this item from your cart?')) return;

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/cart/${itemId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setCart(cart.filter(item => item._id !== itemId));
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Error removing item');
    } finally {
      setUpdating(false);
    }
  };

  const moveToWishlist = async (item) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      
      // Add to wishlist
      await api.post('/wishlist', 
        { productId: item.productId._id },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Remove from cart
      await api.delete(`/cart/${item._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setCart(cart.filter(i => i._id !== item._id));
      setWishlist([...wishlist, item.productId._id]);
      alert('Moved to wishlist!');
    } catch (error) {
      console.error('Error moving to wishlist:', error);
      alert('Error moving to wishlist');
    } finally {
      setUpdating(false);
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Clear all items from your cart?')) return;

    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      await Promise.all(
        cart.map(item => 
          api.delete(`/cart/${item._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        )
      );
      
      setCart([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Error clearing cart');
    } finally {
      setUpdating(false);
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = subtotal > 1000 ? 0 : 100; // Free shipping over ₱1000
    return subtotal + shipping;
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    // Check stock availability
    const outOfStock = cart.find(item => item.productId.stock < item.quantity);
    if (outOfStock) {
      alert(`${outOfStock.productId.name} doesn't have enough stock`);
      return;
    }

    navigate('/checkout');
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
      <Navbar 
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} 
        wishlistCount={wishlist.length} 
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <ShoppingCart size={40} />
            Shopping Cart
          </h1>
          <p className="text-gray-600">
            {cart.length === 0 
              ? 'Your cart is empty' 
              : `${cart.length} item${cart.length > 1 ? 's' : ''} in your cart`
            }
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Add some beautiful flowers to your cart!</p>
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition inline-flex items-center gap-2"
            >
              <ShoppingCart size={20} />
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Cart Items</h2>
                  {cart.length > 0 && (
                    <button
                      onClick={clearCart}
                      disabled={updating}
                      className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                    >
                      Clear Cart
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item._id}
                      className="flex gap-4 p-4 border border-gray-200 rounded-xl hover:border-pink-300 transition"
                    >
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        {item.productId.images && item.productId.images.length > 0 ? (
                          <img
                            src={item.productId.images[0].url}
                            alt={item.productId.name}
                            className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-75 transition"
                            onClick={() => navigate(`/shop`)}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=200&h=200&fit=crop';
                            }}
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package size={32} className="text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="font-bold text-gray-900 mb-1 cursor-pointer hover:text-pink-600 transition">
                              {item.productId.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">{item.productId.category}</p>
                          </div>
                          <span className="text-lg font-bold text-pink-600 whitespace-nowrap">
                            ₱{(item.productId.price * item.quantity).toLocaleString()}
                          </span>
                        </div>

                        <p className="text-sm text-gray-500 mb-3 line-clamp-1">
                          {item.productId.description}
                        </p>

                        {/* Stock Warning */}
                        {item.productId.stock < item.quantity && (
                          <div className="text-sm text-red-600 mb-3">
                            Only {item.productId.stock} in stock!
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                disabled={updating || item.quantity <= 1}
                                className="p-2 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                disabled={updating || item.quantity >= item.productId.stock}
                                className="p-2 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus size={16} />
                              </button>
                            </div>

                            <span className="text-sm text-gray-600">
                              ₱{item.productId.price.toLocaleString()} each
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Move to Wishlist */}
                            {!wishlist.includes(item.productId._id) && (
                              <button
                                onClick={() => moveToWishlist(item)}
                                disabled={updating}
                                className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition disabled:opacity-50"
                                title="Move to wishlist"
                              >
                                <Heart size={18} />
                              </button>
                            )}

                            {/* Remove */}
                            <button
                              onClick={() => removeFromCart(item._id)}
                              disabled={updating}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                              title="Remove from cart"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Continue Shopping Button */}
              <button
                onClick={() => navigate('/Shop')}
                className="w-full py-3 bg-white border-2 border-pink-600 text-pink-600 rounded-xl hover:bg-pink-50 transition font-semibold"
              >
                Continue Shopping
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
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
                    <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
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

                <button
                  onClick={handleCheckout}
                  disabled={updating || cart.length === 0}
                  className="w-full py-4 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Checkout
                  <ArrowRight size={20} />
                </button>

                <div className="mt-6 space-y-3">
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <Package size={20} className="text-pink-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Safe Packaging</p>
                      <p>Your flowers will be carefully packaged</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <ShoppingCart size={20} className="text-pink-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Secure Checkout</p>
                      <p>Your information is protected</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}