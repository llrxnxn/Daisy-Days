const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/product');
const { protect } = require('../middleware/auth');

// GET /cart - Get all cart items for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const cartItems = await Cart.find({ userId: req.user.id })
      .populate({
        path: 'productId',
        select: 'name price description category images stock rating'
      })
      .sort({ createdAt: -1 });

    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Error fetching cart items' });
  }
});

// POST /cart - Add item to cart
router.post('/', protect, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Only ${product.stock} items available in stock`
      });
    }

    // Check if item already exists in cart
    let cartItem = await Cart.findOne({
      userId: req.user.id,
      productId
    });

    if (cartItem) {
      const newQuantity = cartItem.quantity + quantity;

      if (newQuantity > product.stock) {
        return res.status(400).json({
          message: `Cannot add more items. Only ${product.stock} available in stock`
        });
      }

      cartItem.quantity = newQuantity;
      await cartItem.save();
    } else {
      cartItem = new Cart({
        userId: req.user.id,
        productId,
        quantity
      });
      await cartItem.save();
    }

    await cartItem.populate('productId');

    res.status(201).json(cartItem);
  } catch (error) {
    console.error('Error adding to cart:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Item already exists in cart'
      });
    }

    res.status(500).json({ message: 'Error adding item to cart' });
  }
});

// PUT /cart/:id - Update cart item quantity
router.put('/:id', protect, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const cartItem = await Cart.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('productId');

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (quantity > cartItem.productId.stock) {
      return res.status(400).json({
        message: `Only ${cartItem.productId.stock} items available in stock`
      });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.json(cartItem);
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Error updating cart item' });
  }
});

// DELETE /cart/:id - Remove item from cart
router.delete('/:id', protect, async (req, res) => {
  try {
    const cartItem = await Cart.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ message: 'Error removing item from cart' });
  }
});

// DELETE /cart - Clear all cart items
router.delete('/', protect, async (req, res) => {
  try {
    await Cart.deleteMany({ userId: req.user.id });
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Error clearing cart' });
  }
});

// GET /cart/count - Get total items count in cart
router.get('/count', protect, async (req, res) => {
  try {
    const cartItems = await Cart.find({ userId: req.user.id });
    const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    res.json({ count: totalCount });
  } catch (error) {
    console.error('Error getting cart count:', error);
    res.status(500).json({ message: 'Error getting cart count' });
  }
});

module.exports = router;
