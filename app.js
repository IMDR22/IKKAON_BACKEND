// --- Dependencies ---
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// --- Route Imports ---
// Make sure these paths are correct for your project structure
// const userRoutes = require('./routes/userRoutes.js');
// const productRoutes = require('./routes/productRoutes.js');
// const orderRoutes = require('./routes/orderRoutes.js');
// const paymentRoutes = require('./routes/paymentRoutes.js');

// --- App Initialization ---
const app = express();

// --- Core Middleware ---

// Trust the first proxy (important for services like Render)
app.set('trust proxy', 1);

// Set security-related HTTP response headers
app.use(helmet());

// --- CORS Configuration ---
// Define your allowed origins. It's crucial that your deployed frontend URL is here.
const allowedOrigins = [
  'http://localhost:5173' // For local development
];

// If the FRONTEND_URL environment variable is set (e.g., on Render), add it to the list.
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
  console.log('Added deployed frontend URL to CORS allowed list:', process.env.FRONTEND_URL);
}

const corsOptions = {
  origin: function(origin, callback) {
    // This function is the core of the CORS policy.
    // It checks if the incoming request's origin is in our whitelist.
    console.log(`CORS Check: Request from origin -> "${origin}"`); // For debugging

    // `!origin` allows server-to-server requests and REST tools like Postman.
    // `allowedOrigins.includes(origin)` checks if the origin is whitelisted.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the request.
    } else {
      console.error(`CORS Blocked: Origin "${origin}" is not in the allowed list.`); // For debugging
      callback(new Error('This origin is not permitted by the CORS policy.')); // Block the request.
    }
  },
  credentials: true, // Allows cookies and authorization headers to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Enable CORS with the defined options. This must come before your routes.
app.use(cors(corsOptions));

// JSON body parser middleware
app.use(express.json());

// Apply a rate limiter to all API requests to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Limit each IP to 150 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);


// --- API Routes (Ensure these are uncommented and paths are correct) ---
// app.use('/api/users', userRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/payments', paymentRoutes);

// --- Dummy Route for Testing ---
app.get('/api/users/profile', (req, res) => {
    // This is a placeholder to ensure the route exists for testing
    res.json({ message: "This is a dummy user profile response." });
});


// --- Health Check Endpoint ---
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running and healthy' });
});

// --- Error Handling Middleware ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  // Hide detailed errors in production for security
  const errorMessage = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred.'
    : err.message;
  res.status(500).json({ message: errorMessage });
});

// --- Server Startup ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log('Allowed CORS origins:', allowedOrigins);
});
