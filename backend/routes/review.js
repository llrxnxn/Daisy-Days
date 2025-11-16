//routes/review.js
const express = require('express');
const router = express.Router();
const Review = require('../models/review');
const Order = require('../models/order');
const { protect } = require('../middleware/auth');
const Product = require('../models/product'); 

// Initialize bad-words filter
let Filter;
let filter;

try {
  Filter = require('bad-words');
  filter = new Filter();
} catch (error) {
  console.error('Error loading bad-words:', error);
  // Fallback if bad-words fails to load
  filter = {
    clean: (text) => text
  };
}

// Helper function to clean comment
const cleanComment = (comment) => {
  if (!filter) return comment;
  return filter.clean(comment);
};

// 📌 Create or Update Review
router.post('/', protect, async (req, res) => {
  const { orderId, productId, rating, comment } = req.body;

  try {
    // Validate order belongs to user
    const order = await Order.findOne({ _id: orderId, userId: req.user._id });
    if (!order) {
      return res.status(403).json({ success: false, message: 'Order not found or unauthorized' });
    }

    // Validate order status
    if (order.status !== 'delivered') {
      return res.status(400).json({ success: false, message: 'Can only review delivered orders' });
    }

    // Validate product exists in order
    const item = order.items.find(i => i.productId.toString() === productId);
    if (!item) {
      return res.status(400).json({ success: false, message: 'Product not found in order' });
    }

    // Filter bad words from comment
    const cleanedComment = cleanComment(comment);

    // Check if review already exists
    const existing = await Review.findOne({ orderId, productId, userId: req.user._id });
    
    if (existing) {
      // Update existing review
      existing.rating = rating;
      existing.comment = cleanedComment;
      existing.updatedAt = new Date();
      await existing.save();
      return res.json({ success: true, review: existing, isUpdate: true });
    }

    // Create new review
    const review = await Review.create({
      orderId,
      productId,
      userId: req.user._id,
      rating,
      comment: cleanedComment
    });

    await Product.findByIdAndUpdate(productId, {
  $push: { reviews: review._id }
});

    res.status(201).json({ success: true, review, isUpdate: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 📌 Get All Reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find().populate('productId userId', 'name email');
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 📌 Get Review for specific product and user (to check if already reviewed)
router.get('/check/:productId', protect, async (req, res) => {
  try {
    const review = await Review.findOne({
      productId: req.params.productId,
      userId: req.user._id
    });

    if (!review) {
      return res.json({ success: true, hasReview: false });
    }

    res.json({ success: true, hasReview: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 📌 Get reviews for a specific order
router.get('/order/:orderId', protect, async (req, res) => {
  try {
    const reviews = await Review.find({
      orderId: req.params.orderId,
      userId: req.user._id
    });

    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 📌 Update Review
router.put('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, userId: req.user._id });
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Filter bad words from updated comment
    const cleanedComment = req.body.comment ? cleanComment(req.body.comment) : review.comment;

    review.rating = req.body.rating || review.rating;
    review.comment = cleanedComment;
    review.updatedAt = new Date();
    await review.save();

    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 📌 Delete Review
router.post('/bulk-delete', protect, async (req, res) => {
  try {
    const { reviewIds } = req.body;
    await Review.deleteMany({ _id: { $in: reviewIds } });
    res.json({ message: "Reviews deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete reviews" });
  }
});

module.exports = router;