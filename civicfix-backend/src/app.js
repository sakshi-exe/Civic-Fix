const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const { successResponse } = require('./utils/response');
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

connectDB();

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 900000),
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.get('/api/v1/health', (req, res) => {
  successResponse(res, 'CivicFix API is healthy', {
    service: 'civicfix-backend',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/reports', reportRoutes);

app.use('/api/v1', (req, res) => {
  successResponse(res, 'Welcome to CivicFix API', {
    version: 'v1',
    docs: '/api/v1/health',
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
