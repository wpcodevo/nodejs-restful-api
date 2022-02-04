const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

const cookieOptions = {
  expires: new Date(
    Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  ),
  httpOnly: true,
};

if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (id, res) => {
  const token = signToken(id);

  res.cookie('jwt', token, cookieOptions);

  res.status(200).json({
    status: 'success',
    token,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // Create the User
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  user.active = undefined;
  user.password = undefined;

  // Sign the token
  const token = signToken(user.id);
  res.cookie('jwt', token, cookieOptions);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  // Check if email and password was provided
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Check if user exist and password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect Email or Password', 400));
  }

  // Sign the token
  createSendToken(user.id, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // Check if the token was included in the request
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to have access')
    );
  }

  // Validate Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if the user still exist
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exist', 401)
    );
  }

  // Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User changed password, please login again.', 401)
    );
  }

  req.user = currentUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You are not allowed to perform this action', 401)
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Get the user from the collection
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No user found with that email address', 400));
  }

  // Generate Reset Token
  const resetToken = user.createResetToken();
  const url = `${req.protocol}://${req.get('host')}/${resetToken}`;

  // Send Email
  try {
    const info = await sendEmail({
      email: user.email,
      subject: 'Your Reset Token',
      message: `Forgot Password? Send a PATCH request with your Password and Confirm Password to ${url}`,
    });
    await user.save({ validateBeforeSave: false });
    console.log(info);
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetAt = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        `There was a problem sending resetToken to email address`,
        500
      )
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'Your reset token has been sent to your email address',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get the user from the collection
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken,
    passwordResetAt: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Reset Token is invalid or has expired', 400));
  }

  // Update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetAt = undefined;
  await user.save();

  // Sign Token
  createSendToken(user.id, res);
});
