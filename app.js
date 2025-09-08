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
  origin: function(origin, callback){
    if(!origin) return callback(null, true); // allow non-browser tools like Postman
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS']
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
