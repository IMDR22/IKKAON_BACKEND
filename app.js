// --- Dependencies ---
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const userRoutes = require('./routes/userRoutes.js');
const productRoutes = require('./routes/productRoutes.js');
const orderRoutes = require('./routes/orderRoutes.js');
const paymentRoutes = require('./routes/paymentRoutes.js');

// --- App Initialization ---
const app = express();

// --- Trust proxy for apps behind a load balancer ---
app.set('trust proxy', 1);

// --- Security Headers ---
app.use(helmet());

// --- CORS Setup ---
const allowedOrigins = [
  process.env.FRONTEND_URL,  // deployed frontend
  'http://localhost:5173'    // local dev
];

// Custom CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin) return next(); // allow server-to-server or curl requests
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200); // preflight OK
  }

  next();
});

// --- JSON Body Parser ---
app.use(express.json());

// --- Rate Limiter ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api/', apiLimiter);

// --- API Routes ---
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// --- Health Check Endpoint ---
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// --- Error Handling Middleware ---
app.use((err, req, res, next) => {
  console.error(err.stack);

  const errorMessage = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred.'
    : err.message;

  res.status(500).json({ message: errorMessage });
});

// --- Server Startup ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
