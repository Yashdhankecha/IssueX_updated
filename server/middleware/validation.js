const { body, validationResult } = require('express-validator')

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.error('Validation failed:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    })
  }
  next()
}

// FixIt Registration validation (simplified - no phone required)
const validateSignUp = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email'),

  // body('password')
  //   .notEmpty()
  //   .withMessage('Password is required')
  //   .isLength({ min: 6 })
  //   .withMessage('Password must be at least 6 characters long'),

  handleValidationErrors
]

// FixIt Login validation
const validateSignIn = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
]

// FixIt Forgot password validation
const validateForgotPassword = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email'),

  handleValidationErrors
]

// FixIt Reset password validation (simplified - no OTP required)
const validateResetPassword = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  handleValidationErrors
]

module.exports = {
  validateSignUp,
  validateSignIn,
  validateForgotPassword,
  validateResetPassword
} 