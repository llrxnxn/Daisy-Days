// backend/app.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();

// ✅ Allow frontend on port 5173
app.use(cors({
  origin: 'http://localhost:5173',  // your React app
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

module.exports = app;
