const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const User = require('../models/user');
const Product = require('../models/product');
const { protect } = require('../middleware/auth');

// Helper function to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Get Monthly Sales Data
router.get('/monthly-sales', protect, isAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let filter = {};
    
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default: last 12 months
      const now = new Date();
      const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      filter.createdAt = {
        $gte: lastYear,
        $lte: now
      };
    }

    const sales = await Order.aggregate([
      { $match: { ...filter, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format data for chart
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedData = sales.map(item => ({
      month: monthNames[item._id.month - 1],
      sales: item.totalSales,
      orders: item.orderCount
    }));

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching monthly sales', error: error.message });
  }
});

// Get Active Users Count
router.get('/active-users', protect, isAdmin, async (req, res) => {
  try {
    const activeUsers = await User.countDocuments({ isActive: true, role: 'customer' });
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const inactiveUsers = totalUsers - activeUsers;

    res.json({
      active: activeUsers,
      inactive: inactiveUsers,
      total: totalUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching active users', error: error.message });
  }
});

// Get Products by Category
router.get('/products-by-category', protect, isAdmin, async (req, res) => {
  try {
    const productsByCategory = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const formattedData = productsByCategory.map(item => ({
      name: item._id,
      value: item.count
    }));

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products by category', error: error.message });
  }
});

// Get Orders Statistics
router.get('/orders-stats', protect, isAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let filter = {};
    
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default: last 12 months
      const now = new Date();
      const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      filter.createdAt = {
        $gte: lastYear,
        $lte: now
      };
    }

    const totalOrders = await Order.countDocuments(filter);
    const totalRevenue = await Order.aggregate([
      { $match: { ...filter, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    const ordersByStatus = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      ordersByStatus
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders stats', error: error.message });
  }
});

module.exports = router;
