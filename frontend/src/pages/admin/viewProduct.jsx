import React, { useState, useEffect } from 'react';
import { X, Package, DollarSign, Box, Tag, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api/axios';

export default function ViewProductModal({ productId, isOpen, onClose }) {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen && productId) {
      fetchProduct();
    }
  }, [isOpen, productId]);

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/products/${productId}`);
      setProduct(res.data);
      setCurrentImageIndex(0);
    } catch (err) {
      console.error(err);
      alert('Error loading product details');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const nextImage = () => {
    if (product?.images?.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product?.images?.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (stock < 10) return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          </div>
        ) : product ? (
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Image Gallery */}
              <div className="space-y-4">
                {product.images && product.images.length > 0 ? (
                  <>
                    {/* Main Image */}
                    <div className="relative group">
                      <img
                        src={product.images[currentImageIndex].url}
                        alt={product.name}
                        className="w-full h-96 object-cover rounded-2xl shadow-lg"
                      />
                      
                      {/* Navigation Arrows */}
                      {product.images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition"
                          >
                            <ChevronLeft size={24} className="text-gray-800" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition"
                          >
                            <ChevronRight size={24} className="text-gray-800" />
                          </button>
                        </>
                      )}

                      {/* Image Counter */}
                      {product.images.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {product.images.length}
                        </div>
                      )}
                    </div>

                    {/* Thumbnail Gallery */}
                    {product.images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {product.images.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                              currentImageIndex === idx
                                ? 'border-purple-600 shadow-md'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <img
                              src={img.url}
                              alt={`${product.name} ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-96 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <Package size={64} className="text-gray-400" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                {/* Title & Category */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    {product.name}
                  </h1>
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                    <Tag size={16} />
                    {product.category}
                  </span>
                </div>

                {/* Price & Stock Status */}
                <div className="flex items-center gap-4 pb-6 border-b">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Price</div>
                    <div className="text-3xl font-bold text-purple-600">
                      ₱{product.price.toLocaleString()}
                    </div>
                  </div>
                  <div className="h-12 w-px bg-gray-300"></div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Status</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStockStatus(product.stock).color}`}>
                      {getStockStatus(product.stock).text}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Package size={18} />
                    Description
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Additional Info Grid */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Box size={16} />
                      <span className="text-sm">Stock Quantity</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {product.stock}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Calendar size={16} />
                      <span className="text-sm">Added On</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {new Date(product.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                {/* Product ID */}
                <div className="bg-purple-50 p-4 rounded-xl">
                  <div className="text-xs text-gray-500 mb-1">Product ID</div>
                  <code className="text-sm text-purple-700 font-mono break-all">
                    {product._id}
                  </code>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            Product not found
          </div>
        )}
      </div>
    </div>
  );
}