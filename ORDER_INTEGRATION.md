# Order Integration Guide

## ⚠️ Important: Connect Orders to Your Checkout Flow

For the dashboard to show data, you need to create Order documents when customers complete purchases.

---

## Example: Creating Orders from Cart

### Option 1: During Cart Checkout

```javascript
// backend/routes/cart.js - Add a checkout endpoint

router.post('/checkout', auth, async (req, res) => {
  try {
    const { shippingAddress, paymentInfo } = req.body;
    
    // Get cart items
    const cartItems = await Cart.find({ userId: req.user._id }).populate('productId');
    
    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total
    let totalAmount = 0;
    const orderItems = cartItems.map(item => {
      totalAmount += item.productId.price * item.quantity;
      return {
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.price,
        category: item.productId.category
      };
    });

    // Create order
    const Order = require('../models/order');
    const newOrder = new Order({
      userId: req.user._id,
      items: orderItems,
      totalAmount: totalAmount,
      status: 'pending',
      paymentStatus: paymentInfo?.status || 'pending',
      shippingAddress: shippingAddress,
      createdAt: new Date()
    });

    await newOrder.save();

    // Clear cart after successful order
    await Cart.deleteMany({ userId: req.user._id });

    res.json({
      message: 'Order created successfully',
      orderId: newOrder._id,
      totalAmount: totalAmount
    });

  } catch (error) {
    res.status(500).json({ message: 'Checkout failed', error: error.message });
  }
});
```

---

## Frontend: Integrate Checkout with Orders

### Example: Update Cart Page to Create Orders

```jsx
// frontend/src/pages/user/cart.jsx

const handleCheckout = async () => {
  try {
    const shippingAddress = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode
    };

    // Call checkout endpoint (this creates the order)
    const response = await api.post('/cart/checkout', {
      shippingAddress: shippingAddress,
      paymentInfo: { status: 'completed' }
    });

    alert('Order created successfully! Order ID: ' + response.data.orderId);
    
    // Redirect to order confirmation
    navigate('/order-confirmation', { 
      state: { orderId: response.data.orderId } 
    });

  } catch (error) {
    alert('Checkout failed: ' + error.response?.data?.message);
  }
};
```

---

## Sample Order Data Structure

```javascript
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "items": [
    {
      "productId": "507f1f77bcf86cd799439013",
      "quantity": 2,
      "price": 29.99,
      "category": "Birthday"
    },
    {
      "productId": "507f1f77bcf86cd799439014",
      "quantity": 1,
      "price": 49.99,
      "category": "Anniversary"
    }
  ],
  "totalAmount": 109.97,
  "status": "pending",
  "paymentStatus": "completed",
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  "createdAt": "2024-11-16T10:30:00Z",
  "updatedAt": "2024-11-16T10:30:00Z"
}
```

---

## Update Order Status

### Admin Update Order Status

```javascript
// backend/routes/order.js (new file)

const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const auth = require('../middleware/auth');

// Update order status (admin only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { status, paymentStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: status,
        paymentStatus: paymentStatus || undefined,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json({ message: 'Order updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error });
  }
});

// Get all orders (admin)
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const orders = await Order.find()
      .populate('userId', 'firstName lastName email')
      .populate('items.productId', 'name price')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
});

module.exports = router;
```

---

## Sample Data for Testing

### Create Test Orders via MongoDB

```javascript
// Add this to MongoDB directly for testing

db.orders.insertMany([
  {
    userId: ObjectId("user_id_1"),
    items: [
      { productId: ObjectId("prod_1"), quantity: 2, price: 29.99, category: "Birthday" }
    ],
    totalAmount: 59.98,
    status: "delivered",
    paymentStatus: "completed",
    shippingAddress: { firstName: "John", lastName: "Doe", email: "john@test.com" },
    createdAt: new Date("2024-11-01"),
    updatedAt: new Date("2024-11-01")
  },
  {
    userId: ObjectId("user_id_2"),
    items: [
      { productId: ObjectId("prod_2"), quantity: 1, price: 49.99, category: "Anniversary" }
    ],
    totalAmount: 49.99,
    status: "shipped",
    paymentStatus: "completed",
    shippingAddress: { firstName: "Jane", lastName: "Smith", email: "jane@test.com" },
    createdAt: new Date("2024-11-05"),
    updatedAt: new Date("2024-11-05")
  },
  // Add more orders for each month to see monthly sales chart
]);
```

---

## Database Migration (If Needed)

If you have existing orders and need to migrate them:

```javascript
// backend/scripts/migrate-orders.js

const mongoose = require('mongoose');
const Order = require('../models/order');
const Cart = require('../models/cart');

async function migrateOrders() {
  try {
    // This depends on your current order storage
    // Example: if using a different format, transform and insert
    
    console.log('Migration complete');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateOrders();
```

---

## Verification

After implementing orders, verify:

✅ Orders are created when customers checkout
✅ Orders have correct totalAmount
✅ Orders have correct items with categories
✅ Timestamps are correct
✅ User references are correct

Then visit the dashboard Overview tab to see the charts populate with data!

---

## Dashboard Will Show:

- ✅ Monthly Sales: Total revenue by month
- ✅ Total Orders: Count of all orders
- ✅ Total Revenue: Sum of all order amounts
- ✅ Active Users: User activity status
- ✅ Products by Category: Breakdown of inventory
- ✅ Orders by Status: Pending, Confirmed, Shipped, Delivered, Cancelled
- ✅ Monthly Orders Trend: Order count trend line
