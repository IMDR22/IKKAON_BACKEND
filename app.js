const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes.js');
const productRoutes = require('./routes/productRoutes.js');
const orderRoutes = require('./routes/orderRoutes.js');
const paymentRoutes = require('./routes/paymentRoutes.js');

const app = express();

// ✅ Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",                 // local React dev
  "https://ikkaon-frontend.onrender.com"   // deployed frontend
];

// ✅ Dynamic CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Allow requests from allowed origins or requests with no origin (Postman, curl)
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  }

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ✅ Parse JSON requests
app.use(express.json());

// ✅ API routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// ✅ Test routes
app.get("/ping", (req, res) => res.send("pong 🏓 Backend is alive!"));
app.get("/test", (req, res) => res.json({ message: "CORS is working 🚀", origin: req.headers.origin }));

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
