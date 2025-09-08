// Vercel handles the server, so we only need to export the app instance.
// We also place this file inside an 'api' directory, which Vercel recognizes as the entry point.

const express = require('express');
const cors = require('cors');

// Note: The require paths have been updated to be relative to the 'api' directory
const userRoutes = require('../routes/userRoutes.js');
const productRoutes = require('../routes/productRoutes.js');
const orderRoutes = require('../routes/orderRoutes.js');
const paymentRoutes = require('../routes/paymentRoutes.js');

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL, 
  'http://localhost:5173'  
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
  
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
})

// Vercel's serverless function architecture requires you to export the Express app
module.exports = app;
