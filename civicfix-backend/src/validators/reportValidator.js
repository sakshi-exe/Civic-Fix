const { body, param, query } = require('express-validator');

const createReportValidator = [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters long'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),
  body('category').isIn(['pothole', 'garbage', 'water leakage', 'streetlight', 'drainage', 'illegal dumping', 'traffic', 'other']).withMessage('Invalid category'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be a valid number'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be a valid number'),
  body('address').optional().trim().isString(),
  body('ward').optional().trim().isString(),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
];

const updateReportValidator = [
  param('id').isMongoId().withMessage('Invalid report id'),
  body('status').optional().isIn(['pending', 'under review', 'assigned', 'in progress', 'resolved']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('assignedTo').optional().isMongoId().withMessage('Invalid assigned user id'),
];

const reportQueryValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isString(),
  query('status').optional().isString(),
  query('search').optional().isString(),
  query('sortBy').optional().isString(),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('sortOrder must be asc or desc'),
];

module.exports = {
  createReportValidator,
  updateReportValidator,
  reportQueryValidator,
};
