// frontend/src/pages/user/viewProduct.jsx
import React, { useState, useEffect } from 'react';
import { X, Heart, ShoppingCart, Plus, Minus, Star, Truck, Shield, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api/axios';

export default function ViewProduct({ productId, isOpen, onClose }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (isOpen && productId) {
      fetchProduct();
      checkWishlist();
    }
  }, [isOpen, productId]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/products/${productId}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Error loading product details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const checkWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await api.get('/wishlist', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const wishlistIds = response.data.map(item => item.productId || item._id);
      setIsInWishlist(wishlistIds.includes(productId));
    } catch (error) {
      console.log('Wishlist check failed');
    }
  };

  const toggleWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add to wishlist');
        return;
      }

      if (isInWishlist) {
        await api.delete(`/wishlist/${productId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setIsInWishlist(false);
      } else {
        await api.post('/wishlist', { productId }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      alert('Error updating wishlist');
    }
  };

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to add to cart');
        return;
      }

      if (product.stock === 0) {
        alert('This product is out of stock');
        return;
      }

      if (quantity > product.stock) {
        alert(`Only ${product.stock} items available`);
        return;
      }

      setAddingToCart(true);
      await api.post('/cart', {
        productId: product._id,
        quantity: quantity
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      alert(`Added ${quantity} item(s) to cart!`);
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const nextImage = () => {
    if (product.images && product.images.length > 0) {
      setSelectedImage((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product.images && product.images.length > 0) {
      setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (stock < 10) return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition"
        >
          <X size={24} className="text-gray-600" />
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-600"></div>
          </div>
        ) : product ? (
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Left Side - Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative bg-gray-100 rounded-2xl overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <>
                    <img
                      src={product.images[selectedImage].url}
                      alt={product.name}
                      className="w-full h-96 object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&h=600&fit=crop';
                      }}
                    />

                    {/* Image Navigation */}
                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition"
                        >
                          <ChevronLeft size={24} />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition"
                        >
                          <ChevronRight size={24} />
                        </button>

                        {/* Image Indicator */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {product.images.map((_, index) => (
                            <div
                              key={index}
                              className={`w-2 h-2 rounded-full transition ${
                                index === selectedImage ? 'bg-white w-6' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-96 flex items-center justify-center">
                    <Package size={64} className="text-gray-400" />
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === index
                          ? 'border-pink-600 ring-2 ring-pink-200'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-20 object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=200&h=200&fit=crop';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side - Details */}
            <div className="space-y-6">
              {/* Category & Stock Badge */}
              <div className="flex items-center justify-between">
                <span className="px-4 py-2 bg-pink-100 text-pink-600 rounded-full text-sm font-semibold">
                  {product.category}
                </span>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStockStatus(product.stock).color}`}>
                  {getStockStatus(product.stock).text}
                </span>
              </div>

              {/* Product Name */}
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={
                        i < Math.floor(product.rating || 0)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  {(product.rating || 0).toFixed(1)} ({product.reviewCount || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="py-4 border-y">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-pink-600">
                    ₱{product.price.toLocaleString()}
                  </span>
                  {product.stock > 0 && product.stock < 20 && (
                    <span className="text-sm text-orange-600 font-medium">
                      Only {product.stock} left in stock!
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <Minus size={20} />
                      </button>
                      <span className="px-6 py-3 font-semibold text-lg">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.stock}
                        className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">
                      {product.stock} available
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addingToCart}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-lg transition ${
                    product.stock === 0 || addingToCart
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-pink-600 text-white hover:bg-pink-700'
                  }`}
                >
                  {addingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={24} />
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </>
                  )}
                </button>
                <button
                  onClick={toggleWishlist}
                  className="p-4 border-2 border-pink-600 rounded-xl hover:bg-pink-50 transition"
                >
                  <Heart
                    size={24}
                    className={isInWishlist ? 'text-pink-600 fill-pink-600' : 'text-pink-600'}
                  />
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Truck className="text-pink-600 mx-auto mb-2" size={24} />
                  <p className="text-xs text-gray-600 font-medium">Free Delivery</p>
                  <p className="text-xs text-gray-500">Orders over ₱1000</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Shield className="text-pink-600 mx-auto mb-2" size={24} />
                  <p className="text-xs text-gray-600 font-medium">Quality Guarantee</p>
                  <p className="text-xs text-gray-500">100% fresh flowers</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Package className="text-pink-600 mx-auto mb-2" size={24} />
                  <p className="text-xs text-gray-600 font-medium">Easy Returns</p>
                  <p className="text-xs text-gray-500">Within 7 days</p>
                </div>
              </div>

              {/* Product Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Added:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(product.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-600">Product not found</p>
          </div>
        )}
      </div>
    </div>
  );
}