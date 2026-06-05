const express = require('express');
const cors = require('cors');
const logger = require('./middleware/logger');

const app = express();

app.use(logger);
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      process.env.RAILWAY_STATIC_URL,
      'http://localhost:5173',
      'http://localhost:8080',
      'http://localhost',
    ].filter(Boolean);
    
    // Allow the specific exact match OR any Vercel preview URL
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.get('/health', (_req, res) => res.status(200).send('status up and running'));
app.get('/api/health', (_req, res) => res.json({ status: 'OK', message: 'TaskFlow API running' }));

app.use((err, req, res, _next) => {
  const status = err.statusCode || 500;
  console.error(`\x1b[31m[ERROR] ${req.method} ${req.originalUrl}\x1b[0m`);
  console.error(`  Status: ${status}`);
  console.error(`  Message: ${err.message}`);
  if (status === 500) console.error(`  Stack: ${err.stack}`);
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
