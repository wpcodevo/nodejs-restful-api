const AppError = require('../utils/appError');

const handleCastErrorDB = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleValidationErrorDB = (err) => {
  const message = Object.values(err.errors).map((el) => el.message);
  return new AppError(`Invalid input: ${message.join(', ')}`, 400);
};

const handleDuplicateErrorDB = (err) => {
  const message = Object.values(err.keyValue).map((el) => el);
  return new AppError(`Duplicate field: ${message.join(', ')}`, 400);
};

const handleJsonWebTokenError = () =>
  new AppError(`Invalid Token, please login again.`, 401);

const handleTokenExpiredError = () =>
  new AppError(`Token has expired, please login again.`, 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('Error🔥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.code === 11000) error = handleDuplicateErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJsonWebTokenError();
    if (err.name === 'TokenExpiredError') error = handleTokenExpiredError();
    sendErrorProd(error, res);
  }
};
