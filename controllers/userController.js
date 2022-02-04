const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'This route is not defined yet',
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'This route is not defined yet',
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'This route is not defined yet',
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'This route is not defined yet',
  });
});
exports.deleteUser = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'This route is not defined yet',
  });
});
