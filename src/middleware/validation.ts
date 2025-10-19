import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

export const validateRegister = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('role').isIn(['customer', 'delivery_staff', 'admin']).withMessage('Invalid role'),
  body('phone').optional().isMobilePhone('en-IN').withMessage('Invalid Indian phone number'),
  handleValidationErrors
];

export const validatePackage = [
  body('trackingNumber').notEmpty().trim().withMessage('Tracking number is required'),
  body('senderName').notEmpty().trim().withMessage('Sender name is required'),
  body('senderAddress').notEmpty().trim().withMessage('Sender address is required'),
  body('receiverName').notEmpty().trim().withMessage('Receiver name is required'),
  body('receiverAddress').notEmpty().trim().withMessage('Receiver address is required'),
  body('receiverPhone').isMobilePhone('en-IN').withMessage('Valid Indian receiver phone is required'),
  body('estimatedDelivery').isISO8601().withMessage('Valid estimated delivery date is required'),
  body('weight').isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
  body('description').optional().trim(),
  handleValidationErrors
];

export const validatePackageStatusUpdate = [
  body('status').isIn(['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed'])
    .withMessage('Invalid status'),
  body('location').optional().trim(),
  body('notes').optional().trim(),
  handleValidationErrors
];
