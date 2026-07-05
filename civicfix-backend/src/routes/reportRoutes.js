const express = require('express');
const { createReport, getReports, getReportById, updateReport, deleteReport } = require('../controllers/reportController');
const { protect, authorizeRoles } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const { createReportValidator, updateReportValidator, reportQueryValidator } = require('../validators/reportValidator');

const router = express.Router();

router.post('/', protect, createReportValidator, validateRequest, createReport);
router.get('/', protect, reportQueryValidator, validateRequest, getReports);
router.get('/:id', protect, getReportById);
router.put('/:id', protect, updateReportValidator, validateRequest, updateReport);
router.delete('/:id', protect, authorizeRoles('admin'), deleteReport);

module.exports = router;
