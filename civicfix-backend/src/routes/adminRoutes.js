const express = require('express');
const { getUsers, assignMunicipality, updateReportStatus, deleteReport, getAdminAnalytics } = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/users', protect, authorizeRoles('admin'), getUsers);
router.post('/assign-municipality', protect, authorizeRoles('admin'), assignMunicipality);
router.put('/reports/:id/status', protect, authorizeRoles('admin', 'municipality'), updateReportStatus);
router.delete('/reports/:id', protect, authorizeRoles('admin'), deleteReport);
router.get('/analytics', protect, authorizeRoles('admin'), getAdminAnalytics);

module.exports = router;
