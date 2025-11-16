const express = require('express');
const router = express.Router();
const Wishlist = require('../models/wishlist');
const Product = require('../models/product');
const { protect } = require('../middleware/auth');

// GET /wishlist/check/:productId - Check if product is in wishlist (MUST BE BEFORE /wishlist/:id)
router.get('/check/:productId', protect, async (req, res) => {
  try {
    const wishlistItem = await Wishlist.findOne({
      userId: req.user.id,
      productId: req.params.productId
    });

    res.json({
      isInWishlist: !!wishlistItem,
      wishlistItem: wishlistItem || null
    });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    res.status(500).json({ message: 'Error checking wishlist' });
  }
});

// DELETE /wishlist/product/:productId - Remove item by product ID (MUST BE BEFORE /wishlist/:id)
router.delete('/product/:productId', protect, async (req, res) => {
  try {
    const result = await Wishlist.findOneAndDelete({
      userId: req.user.id,
      productId: req.params.productId
    });

    if (!result) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }

    res.json({
      success: true,
      message: 'Item removed from wishlist'
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Error removing item from wishlist' });
  }
});

// GET /wishlist - Get all wishlist items for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    console.log('Fetching wishlist for user:', req.user.id);
    const wishlistItems = await Wishlist.find({ userId: req.user.id })
      .populate({
        path: 'productId',
        select: 'name price description category images stock rating'
      })
      .sort({ createdAt: -1 });

    console.log('Wishlist items found:', wishlistItems.length);
    res.json(wishlistItems);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Error fetching wishlist items' });
  }
});

// POST /wishlist - Add item to wishlist
router.post('/', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    console.log('Adding to wishlist - User:', req.user.id, 'Product:', productId);

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if item already exists in wishlist
    let wishlistItem = await Wishlist.findOne({
      userId: req.user.id,
      productId
    });

    if (wishlistItem) {
      return res.status(400).json({
        message: 'Product already in wishlist'
      });
    }

    wishlistItem = new Wishlist({
      userId: req.user.id,
      productId
    });

    await wishlistItem.save();
    await wishlistItem.populate('productId');

    console.log('Added to wishlist:', wishlistItem);
    res.status(201).json(wishlistItem);
  } catch (error) {
    console.error('Error adding to wishlist:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Product already in wishlist'
      });
    }

    res.status(500).json({ message: 'Error adding item to wishlist' });
  }
});

// DELETE /wishlist/:id - Remove item from wishlist
router.delete('/:id', protect, async (req, res) => {
  try {
    const wishlistItem = await Wishlist.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!wishlistItem) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }

    await Wishlist.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Item removed from wishlist'
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Error removing item from wishlist' });
  }
});

module.exports = router;

module.exports = router;
