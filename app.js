const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes.js');
const productRoutes = require('./routes/productRoutes.js');
const orderRoutes = require('./routes/orderRoutes.js');
const paymentRoutes = require('./routes/paymentRoutes.js');

const app = express();

// ✅ Allowed origins (local + deployed frontend)
const allowedOrigins = [
  "http://localhost:5173",                 
  "https://ikkaon-frontend.onrender.com"
];

// ✅ Configure CORS
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS: " + origin));
    }
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // ✅ handle preflight everywhere

app.use(express.json());

// ✅ API routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

app.get("/test", (req, res) => {
  res.json({ message: "CORS is working 🚀", origin: req.headers.origin });
});

app.get("/ping", (req, res) => {
  res.send("pong 🏓 Backend is alive!");
});



// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.message && err.message.startsWith("Not allowed by CORS")) {
    return res.status(403).json({ error: err.message });
  }
  res.status(500).send('Something broke!');
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
