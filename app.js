require('dotenv').config();
const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes.js');
const productRoutes = require('./routes/productRoutes.js');
const orderRoutes = require('./routes/orderRoutes.js');
const paymentRoutes = require('./routes/paymentRoutes.js');

const app = express();

// If Render is behind a proxy
app.set('trust proxy', true);

// ------------------------
// CORS CONFIGURATION START
// ------------------------
app.use(cors({
    origin: process.env.FRONTEND_URL,  // Your frontend URL
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    credentials: true                 // needed if sending cookies or auth headers
}));

// Handle OPTIONS preflight for all routes
app.options('*', cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    credentials: true
}));
// ----------------------
// CORS CONFIGURATION END
// ----------------------

app.use(express.json());  // JSON parsing middleware

// ----------------------
// ROUTES
// ----------------------
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// ----------------------
// ERROR HANDLER
// ----------------------
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// ----------------------
// START SERVER
// ----------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
