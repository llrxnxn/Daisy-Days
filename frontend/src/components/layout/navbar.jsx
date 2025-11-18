import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Menu,
  X,
  Heart,
  User,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ cartCount = 0, wishlistCount = 0 }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setShowProfileMenu(false);
    navigate("/");
    window.location.reload();
  };

  const handleCartClick = () => {
    if (!user) navigate("/Login");
    else navigate("/cart");
  };

  const handleWishlistClick = () => {
    if (!user) navigate("/Login");
    else navigate("/wishlist");
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => {
              if (user?.role === "admin") navigate("/AdminDashboard");
              else navigate("/");
            }}
          >
            <span className="text-3xl">🌼</span>
            <span className="text-2xl font-bold text-pink-600">Daisy Days</span>
          </div>

          {/* Desktop Menu (Customer Only) */}
          <div className="hidden md:flex items-center space-x-8">
            {user?.role !== "admin" && (
              <>
                <button onClick={() => navigate("/")} className="text-gray-700 hover:text-pink-600 transition">
                  Home
                </button>
                <button onClick={() => navigate("/shop")} className="text-gray-700 hover:text-pink-600 transition">
                  Shop
                </button>
                {/* <button onClick={() => navigate("/categories")} className="text-gray-700 hover:text-pink-600 transition">
                  Categories
                </button> */}
              </>
            )}
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">

            {/* Wishlist (Customer Only) */}
            {user?.role !== "admin" && (
              <button
                onClick={handleWishlistClick}
                className="relative text-gray-700 hover:text-pink-600 transition"
              >
                <Heart size={22} />
                {user && wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>
            )}

            {/* Cart (Customer Only) */}
            {user?.role !== "admin" && (
              <button
                onClick={handleCartClick}
                className="relative text-gray-700 hover:text-pink-600 transition"
              >
                <ShoppingCart size={22} />
                {user && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* User Profile */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-pink-600"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center text-white font-semibold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>

                    {/* My Profile (Customer Only) */}
                    {user?.role !== "admin" && (
                      <>
                        <button
                          onClick={() => {
                            navigate("/profile");
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-pink-50 text-gray-700 flex items-center space-x-2"
                        >
                          <User size={16} />
                          <span>My Profile</span>
                        </button>
                        <button
                          onClick={() => {
                            navigate("/transactions");
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-pink-50 text-gray-700 flex items-center space-x-2"
                        >
                          <ShoppingCart size={16} />
                          <span>Transaction History</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-pink-50 text-red-600 flex items-center space-x-2"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/Login")}
                className="hidden md:block bg-pink-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-pink-700 transition"
              >
                Login
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2">

            {/* Customer Only Menu */}
            {user?.role !== "admin" && (
              <>
                <button
                  onClick={() => {
                    navigate("/");
                    setIsMenuOpen(false);
                  }}
                  className="block text-gray-700 hover:text-pink-600 py-2"
                >
                  Home
                </button>

                <button
                  onClick={() => {
                    navigate("/shop");
                    setIsMenuOpen(false);
                  }}
                  className="block text-gray-700 hover:text-pink-600 py-2"
                >
                  Shop
                </button>

                <button
                  onClick={() => {
                    navigate("/categories");
                    setIsMenuOpen(false);
                  }}
                  className="block text-gray-700 hover:text-pink-600 py-2"
                >
                  Categories
                </button>
              </>
            )}

            {/* Logged in */}
            {user ? (
              <div className="border-t border-gray-200 mt-2 pt-2">
                <p className="px-2 py-1 font-semibold text-gray-900">
                  {user.name}
                </p>

                {/* Profile (Customer Only) */}
                {user?.role !== "admin" && (
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-2 py-2 text-gray-700 hover:text-pink-600"
                  >
                    My Profile
                  </button>
                )}

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-2 py-2 text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  navigate("/Login");
                  setIsMenuOpen(false);
                }}
                className="w-full bg-pink-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-pink-700 transition mt-2"
              >
                Login
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
