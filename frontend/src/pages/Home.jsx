import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, Truck, Shield, Headphones } from 'lucide-react';
import Navbar from '../components/layout/navbar';
import Footer from '../components/layout/footer';
import '../index.css';

export default function Home() {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      loadUserData();
    }

    // Load products
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Replace with your API endpoint
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback to featured products if API fails
      setProducts(featuredProducts);
    }
  };

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch wishlist
      const wishlistRes = await fetch('http://localhost:5000/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const wishlistData = await wishlistRes.json();
      setWishlist(wishlistData);
      setWishlistCount(wishlistData.length);

      // Fetch cart
      const cartRes = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const cartData = await cartRes.json();
      setCart(cartData);
      setCartCount(cartData.reduce((sum, item) => sum + item.quantity, 0));
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const featuredProducts = [
    {
      id: 1,
      name: "Rose Bouquet Deluxe",
      price: 1299,
      image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=400&h=400&fit=crop",
      rating: 4.8,
      category: "Bouquets"
    },
    {
      id: 2,
      name: "Sunflower Sunshine",
      price: 899,
      image: "https://images.unsplash.com/photo-1597848212624-e530501f4e1b?w=400&h=400&fit=crop",
      rating: 4.9,
      category: "Single Stems"
    },
    {
      id: 3,
      name: "Lily Elegance",
      price: 1499,
      image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400&h=400&fit=crop",
      rating: 4.7,
      category: "Arrangements"
    },
    {
      id: 4,
      name: "Tulip Paradise",
      price: 1099,
      image: "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=400&h=400&fit=crop",
      rating: 4.6,
      category: "Bouquets"
    }
  ];

  const categories = [
    { name: "Bouquets", icon: "💐"},
    { name: "Single Stems", icon: "🌹"},
    { name: "Arrangements", icon: "🌺"},
    { name: "Seasonal", icon: "🌸"}
  ];



  const handleShopNow = () => {
    if (!user) {
      navigate('/Login');
    } else {
      navigate('/shop'); // Redirect to shop page if logged in
    }
  };

  const displayProducts = products.length > 0 ? products : featuredProducts;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex flex-col">
      {/* Navbar */}
      <Navbar cartCount={cartCount} wishlistCount={wishlistCount} />

      {/* Hero Section */}
      <section id="home" className="relative py-20 px-6 sm:px-8 md:px-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center text-center md:text-left">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Bloom Your Day with
              <span className="text-pink-600"> Fresh Flowers</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-lg mx-auto md:mx-0">
              Handpicked blooms delivered fresh to your doorstep. Make every moment special with Daisy Days.
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
              <button
                onClick={handleShopNow}
                className="bg-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-pink-700 transition transform hover:scale-105"
              >
                Shop Now
              </button>
              <button className="border-2 border-pink-600 text-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-pink-50 transition">
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center md:justify-start gap-8 pt-8">
              <div>
                <div className="text-3xl font-bold text-pink-600">500+</div>
                <div className="text-gray-600">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-pink-600">100+</div>
                <div className="text-gray-600">Flower Varieties</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-pink-600">4.9★</div>
                <div className="text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&h=600&fit=crop"
              alt="Beautiful flower bouquet"
              className="rounded-3xl shadow-2xl w-full max-w-md"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-16 px-6 sm:px-8 bg-white text-center">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-gray-900">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-pink-50 to-pink-100 p-8 rounded-2xl hover:shadow-lg transition transform hover:scale-105 cursor-pointer"
              >
                <div className="text-5xl mb-4">{cat.icon}</div>
                <h3 className="font-bold text-lg text-gray-900">{cat.name}</h3>
                <p className="text-gray-600">{cat.count} products</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="shop" className="py-16 px-6 sm:px-8 bg-gradient-to-t from-pink-50 to-white text-center">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Flowers</h2>
          <p className="text-lg text-gray-600 mb-12">Our best-selling blooms, loved by customers</p>

          {!user && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
              <p className="text-yellow-800">
                <span className="font-semibold">Please login</span> to view and purchase products
              </p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:scale-105 text-left"
              >
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover"
                  />
                  <span className="absolute top-4 left-4 bg-pink-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    New
                  </span>
                </div>
                <div className="p-6">
                  <div className="text-sm text-gray-500 mb-1">{product.category}</div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{product.name}</h3>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill="currentColor" />
                      ))}
                    </div>
                    <span className="text-gray-600 text-sm">({product.rating})</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-pink-600">₱{product.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {user && (
            <div className="mt-12">
              <button
                onClick={() => navigate('/shop')}
                className="bg-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-pink-700 transition transform hover:scale-105"
              >
                View All Products
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 sm:px-8 bg-white text-center">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { icon: Truck, title: "Free Delivery", desc: "Free shipping on orders over ₱1,000" },
            { icon: Shield, title: "Quality Guarantee", desc: "100% fresh flowers or your money back" },
            { icon: Headphones, title: "24/7 Support", desc: "We're here to help anytime you need" },
          ].map((feature, idx) => (
            <div key={idx} className="p-8 rounded-2xl hover:shadow-md transition">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="text-pink-600" size={32} />
              </div>
              <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-16 px-6 sm:px-8 bg-gradient-to-r from-pink-50 to-purple-50 text-center md:text-left">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <img
            src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&h=500&fit=crop"
            alt="Flower arrangement"
            className="rounded-3xl shadow-2xl mx-auto md:mx-0"
          />
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-gray-900">About Daisy Days</h2>
            <p className="text-lg text-gray-600">
              At Daisy Days, we’re passionate about capturing the beauty of nature in timeless satin blooms. Each arrangement is handcrafted with love, care, and attention to every delicate detail bringing elegance that lasts.
            </p>
            <p className="text-lg text-gray-600">
              Since 2020, we’ve been spreading smiles with beautifully designed satin flowers that never fade. Perfect for every occasion, our creations blend artistry and charm, a touch of nature’s grace that stays with you, always.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}