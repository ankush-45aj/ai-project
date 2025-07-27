require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../fronted/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../fronted', 'build', 'index.html'));
  });
}

// Root endpoint
app.get('/', (req, res) => {
  res.send('AI BANKING API is running');
});

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app; // Export the app, not the server
