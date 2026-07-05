const express = require('express');
const { getDashboardOverview } = require('../controllers/dashboardController');
const { protect, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/overview', protect, authorizeRoles('admin', 'municipality'), getDashboardOverview);

module.exports = router;
