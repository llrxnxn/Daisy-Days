// backend/server.js
const app = require('./app');
const connectDatabase = require('./config/database');
const cloudinary = require('cloudinary');
const dotenv = require('dotenv');

dotenv.config();

// Connect MongoDB
connectDatabase();

// Cloudinary setup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🌼 Welcome to Daisy Days API',
    version: '1.0.0',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/Login',
      getUser: 'GET /api/auth/me'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
