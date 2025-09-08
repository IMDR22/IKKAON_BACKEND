// --- Dependencies ---
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// --- App Initialization ---
const app = express();
console.log("Server process started.");

// --- Core Middleware ---
app.set('trust proxy', 1);
app.use(helmet());

// --- CORS Configuration ---
const allowedOrigins = [
  'http://localhost:5173'
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// Log the final list of allowed origins when the server starts.
// This is VERY IMPORTANT for debugging. Check this in your Render logs.
console.log('ALLOWED CORS ORIGINS:', allowedOrigins);


const corsOptions = {
  origin: function(origin, callback) {
    // This log will show up for every single request that needs a CORS check.
    console.log(`[CORS CHECK] Request received from origin: ${origin}`);

    if (!origin || allowedOrigins.includes(origin)) {
      console.log(`[CORS CHECK] SUCCESS: Origin allowed.`);
      callback(null, true);
    } else {
      console.error(`[CORS CHECK] FAILED: Origin "${origin}" is not in the allowed list.`);
      callback(new Error('This origin is not permitted by the CORS policy.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// We apply the CORS middleware to all routes.
app.use(cors(corsOptions));


// --- DEBUGGING MIDDLEWARE ---
// This will log every single request that gets past the CORS check
app.use((req, res, next) => {
  console.log(`[REQUEST LOGGER] ${req.method} ${req.originalUrl} - Origin: ${req.headers.origin}`);
  next();
});


// --- JSON parsing and Rate Limiting ---
app.use(express.json());
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);


// --- API Routes (placeholders for now) ---
// Make sure your actual userRoutes are active for this to work
// const userRoutes = require('./routes/userRoutes.js');
// app.use('/api/users', userRoutes);

// Dummy route for testing that the path is reachable
app.get('/api/users/profile', (req, res) => {
    console.log("--> Successfully hit the /api/users/profile endpoint.");
    res.json({ message: "User profile data from dummy endpoint." });
});


// --- Health Check Endpoint ---
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// --- Error Handling ---
app.use((err, req, res, next) => {
  console.error("[GLOBAL ERROR HANDLER]", err.stack);
  res.status(500).json({ message: err.message || 'An unexpected error occurred.' });
});

// --- Server Startup ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
