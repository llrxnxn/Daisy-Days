import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../api/axios';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use 'token' instead of 'authToken' to match the Auth context and Login page
  const authToken = localStorage.getItem('token');

  // Fetch wishlist
  const fetchWishlist = async () => {
    if (!authToken) {
      console.log('No auth token found - user not logged in');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching wishlist with token:', authToken.substring(0, 20) + '...');
      const response = await axios.get('/wishlist', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('Wishlist fetched successfully:', response.data);
      setWishlist(response.data || []);
    } catch (err) {
      console.error('Error fetching wishlist:', err.response?.data || err.message);
      setError('Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  };

  // Add to wishlist
  const addToWishlist = async (productId) => {
    if (!authToken) {
      const msg = 'Please login to add to wishlist';
      setError(msg);
      console.warn(msg);
      return;
    }

    try {
      console.log('Adding product to wishlist:', productId);
      const response = await axios.post(
        '/wishlist',
        { productId },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log('Product added to wishlist:', response.data);
      // Update state immediately to reflect the change across all components
      setWishlist(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add to wishlist';
      console.error('Error adding to wishlist:', errorMsg);
      setError(errorMsg);
      throw err;
    }
  };

  // Remove from wishlist by ID
  const removeFromWishlist = async (wishlistItemId) => {
    if (!authToken) {
      console.warn('No auth token for removal');
      return;
    }

    try {
      console.log('Removing wishlist item:', wishlistItemId);
      await axios.delete(`/wishlist/${wishlistItemId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('Item removed from wishlist');
      setWishlist(wishlist.filter(item => item._id !== wishlistItemId));
    } catch (err) {
      console.error('Error removing from wishlist:', err.response?.data || err.message);
      setError('Failed to remove from wishlist');
    }
  };

  // Remove from wishlist by product ID
  const removeFromWishlistByProductId = async (productId) => {
    if (!authToken) {
      console.warn('No auth token for removal');
      return;
    }

    try {
      console.log('Removing product from wishlist:', productId);
      await axios.delete(`/wishlist/product/${productId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('Product removed from wishlist');
      // Update state immediately to remove from all components
      setWishlist(prev => prev.filter(item => item.productId?._id !== productId));
    } catch (err) {
      console.error('Error removing from wishlist:', err.response?.data || err.message);
      setError('Failed to remove from wishlist');
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return wishlist.some(item => 
      item.productId?._id === productId || item.productId === productId
    );
  };

  // Clear error
  const clearError = () => setError(null);

  // Fetch wishlist on component mount and when auth token changes
  useEffect(() => {
    console.log('WishlistProvider mounted or auth token changed');
    fetchWishlist();
  }, [authToken]);

  const value = {
    wishlist,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    removeFromWishlistByProductId,
    isInWishlist,
    fetchWishlist,
    clearError
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};
