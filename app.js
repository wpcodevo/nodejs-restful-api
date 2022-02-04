require('dotenv').config({ path: `${__dirname}/config.env` });
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

// CONNECT DB
require('./utils/db')();

// MIDDLEWARE
// 1. Set HTTP Headers
app.use(helmet());

// 2. Body Parser
app.use(express.json({ limit: '10kb' }));

// 3. Data Sanitization
app.use(xss());

// 4. Data Sanitization NoSQL injection
app.use(mongoSanitize());

// 5. Parameter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'price',
      'difficulty',
      'ratingsAverage',
      'ratingsQuantity',
    ],
  })
);

// 6. Logger
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// 7. Request Rate Limit
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 99,
  message: 'Too many requests from this IP, please try again after 1 hour',
});

app.use('/api', limiter);

// ROUTE
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// UNHANDLED ROUTE
app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found on this server`, 404));
});

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

module.exports = app;
