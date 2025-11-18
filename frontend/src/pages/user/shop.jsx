// frontend/src/pages/user/shop.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Filter, X, Package, Heart, ShoppingCart, ChevronDown, Star } from 'lucide-react';
import Navbar from '../../components/layout/navbar';
import Footer from '../../components/layout/footer';
import ViewProduct from './viewProduct';
import { useWishlist } from '../../context/WishlistContext';
import api from '../../api/axios';

export default function Shop() {
  const navigate = useNavigate();
  const location = useLocation();
  const { wishlist, isInWishlist, addToWishlist, removeFromWishlistByProductId } = useWishlist();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(
    location.state?.category ? [location.state.category] : []
  );
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [cart, setCart] = useState([]);

  // Modal state - ITO ANG KULANG!
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const categories = ['Birthday', 'Anniversary', 'Romance', 'Holiday', 'Get Well'];
  const ratingOptions = [
    { value: 5, label: '5 Stars' },
    { value: 4, label: '4 Stars & Up' },
    { value: 3, label: '3 Stars & Up' },
    { value: 2, label: '2 Stars & Up' },
    { value: 1, label: '1 Star & Up' }
  ];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  useEffect(() => {
    fetchProducts();
    loadUserData();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchQuery, selectedCategories, sortBy, priceRange, selectedRatings]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products');
      setProducts(response.data);
      
      if (response.data.length > 0) {
        const prices = response.data.map(p => p.price);
        const max = Math.max(...prices);
        setMaxPrice(max);
        setPriceRange([0, max]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const cartRes = await api.get('/cart', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setCart(cartRes.data);
      } catch (err) {
        console.log('Cart not available');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Function para buksan ang modal - ITO ANG FUNCTION NA KULANG!
  const openProductModal = (productId) => {
    setSelectedProductId(productId);
    setIsModalOpen(true);
  };

  // Function para isara ang modal
  const closeProductModal = () => {
    setIsModalOpen(false);
    setSelectedProductId(null);
    // Refresh user data after modal closes (in case wishlist/cart changed)
    loadUserData();
  };

  const filterAndSortProducts = () => {
  let filtered = [...products];

  if (searchQuery) {
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (selectedCategories.length > 0) {
    filtered = filtered.filter(product => 
      selectedCategories.includes(product.category)
    );
  }

  filtered = filtered.filter(product => 
    product.price >= priceRange[0] && product.price <= priceRange[1]
  );

  // FIX: Updated rating filter logic - exact match only
  if (selectedRatings.length > 0) {
    filtered = filtered.filter(product => {
      const rating = product.rating || 0;
      const flooredRating = Math.floor(rating);
      
      // Check if the product's floored rating exactly matches any selected rating
      return selectedRatings.includes(flooredRating);
    });
  }

  switch (sortBy) {
    case 'price-low':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'name-asc':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      filtered.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'rating':
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'newest':
    default:
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
  }

  setFilteredProducts(filtered);
};

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleRating = (rating) => {
    setSelectedRatings(prev => 
      prev.includes(rating)
        ? prev.filter(r => r !== rating)
        : [...prev, rating]
    );
  };

  const handleAddToWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/Login');
        return;
      }

      if (isInWishlist(productId)) {
        // Remove from wishlist
        await removeFromWishlistByProductId(productId);
      } else {
        // Add to wishlist
        await addToWishlist(productId);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/Login');
        return;
      }

      if (product.stock === 0) {
        alert('This product is out of stock');
        return;
      }

      await api.post('/cart', { 
        productId: product._id,
        quantity: 1
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      alert('Added to cart!');
      loadUserData();
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding to cart');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedRatings([]);
    setSortBy('newest');
    setPriceRange([0, maxPrice]);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (stock < 10) return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const activeFiltersCount = selectedCategories.length + selectedRatings.length + 
    (priceRange[0] !== 0 || priceRange[1] !== maxPrice ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} wishlistCount={wishlist.length} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Shop Flowers</h1>
          <p className="text-gray-600">Discover our beautiful collection of satin flowers</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search flowers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none w-full md:w-56 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 cursor-pointer"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center justify-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition relative"
            >
              <Filter size={20} />
              Filters
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {(selectedCategories.length > 0 || searchQuery || selectedRatings.length > 0 || 
            priceRange[0] !== 0 || priceRange[1] !== maxPrice) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchQuery && (
                <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm flex items-center gap-2">
                  Search: "{searchQuery}"
                  <X size={14} className="cursor-pointer" onClick={() => setSearchQuery('')} />
                </span>
              )}
              {selectedCategories.map(cat => (
                <span key={cat} className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm flex items-center gap-2">
                  {cat}
                  <X size={14} className="cursor-pointer" onClick={() => toggleCategory(cat)} />
                </span>
              ))}
              {selectedRatings.map(rating => (
                <span key={rating} className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm flex items-center gap-2">
                  {rating}+ Stars
                  <X size={14} className="cursor-pointer" onClick={() => toggleRating(rating)} />
                </span>
              ))}
              {(priceRange[0] !== 0 || priceRange[1] !== maxPrice) && (
                <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm flex items-center gap-2">
                  ₱{priceRange[0].toLocaleString()} - ₱{priceRange[1].toLocaleString()}
                  <X size={14} className="cursor-pointer" onClick={() => setPriceRange([0, maxPrice])} />
                </span>
              )}
              <button
                onClick={clearFilters}
                className="px-3 py-1 text-pink-600 hover:text-pink-800 text-sm font-medium"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <aside className={`lg:block ${showFilters ? 'block' : 'hidden'} lg:col-span-1`}>
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <Filter size={20} />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="bg-pink-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-pink-600 hover:text-pink-800 text-sm font-medium"
                >
                  Reset
                </button>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>Category</span>
                  {selectedCategories.length > 0 && (
                    <span className="text-xs text-pink-600">({selectedCategories.length})</span>
                  )}
                </h4>
                <div className="space-y-2">
                  {categories.map(category => (
                    <label
                      key={category}
                      className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500 cursor-pointer"
                      />
                      <span className="text-gray-700">{category}</span>
                      <span className="ml-auto text-xs text-gray-500">
                        ({products.filter(p => p.category === category).length})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Price Range</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Min"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || maxPrice])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Max"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full accent-pink-600"
                  />
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>₱{priceRange[0].toLocaleString()}</span>
                    <span>₱{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>Customer Rating</span>
                  {selectedRatings.length > 0 && (
                    <span className="text-xs text-pink-600">({selectedRatings.length})</span>
                  )}
                </h4>
                <div className="space-y-2">
                  {ratingOptions.map(option => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRatings.includes(option.value)}
                        onChange={() => toggleRating(option.value)}
                        className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500 cursor-pointer"
                      />
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < option.value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                        <span className="text-gray-700 text-sm ml-1">{option.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{products.length}</span> products
              </p>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-pink-600 hover:text-pink-800 font-medium"
                >
                  Clear all filters ({activeFiltersCount})
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-600"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                <Package size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock);
                  const isProductInWishlist = isInWishlist(product._id);
                  const rating = product.rating || 0;

                  return (
                    <div
                      key={product._id}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition group"
                    >
                      <div className="relative">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-64 object-cover cursor-pointer group-hover:scale-105 transition duration-300"
                            onClick={() => openProductModal(product._id)}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=400&fit=crop';
                            }}
                          />
                        ) : (
                          <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                            <Package size={48} className="text-gray-400" />
                          </div>
                        )}

                        <button
                          onClick={() => handleAddToWishlist(product._id)}
                          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-pink-50 transition"
                        >
                          <Heart
                            size={20}
                            className={isProductInWishlist ? 'text-pink-600 fill-pink-600' : 'text-gray-600'}
                          />
                        </button>

                        <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                      </div>

                      <div className="p-6">
                        <div className="text-sm text-pink-600 font-medium mb-1">{product.category}</div>
                        <h3
                          className="font-bold text-lg text-gray-900 mb-2 cursor-pointer hover:text-pink-600 transition line-clamp-1"
                          onClick={() => openProductModal(product._id)}
                        >
                          {product.name}
                        </h3>

                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            ({rating.toFixed(1)})
                          </span>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
                          {product.description}
                        </p>

                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold text-pink-600">
                            ₱{product.price.toLocaleString()}
                          </span>
                          {product.stock > 0 && (
                            <span className="text-sm text-gray-500">
                              {product.stock} left
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0}
                          className={`w-full py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                            product.stock === 0
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-pink-600 text-white hover:bg-pink-700'
                          }`}
                        >
                          <ShoppingCart size={20} />
                          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* MODAL COMPONENT - ITO ANG KULANG SA ORIGINAL CODE! */}
      <ViewProduct 
        productId={selectedProductId}
        isOpen={isModalOpen}
        onClose={closeProductModal}
      />

      <Footer />
    </div>
  );
}