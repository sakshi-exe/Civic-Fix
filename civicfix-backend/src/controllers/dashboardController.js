const Report = require('../models/Report');
const { successResponse } = require('../utils/response');

exports.getDashboardOverview = async (req, res, next) => {
  try {
    const [totalReports, pendingReports, resolvedReports, categoryStats, wardStats, monthlyStats, recentReports] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments({ status: 'resolved' }),
      Report.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Report.aggregate([
        { $group: { _id: '$ward', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Report.aggregate([
        {
          $group: {
            _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]),
      Report.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('reportedBy', 'name email role'),
    ]);

    return successResponse(res, 'Dashboard overview fetched successfully', {
      totals: {
        totalReports,
        pendingReports,
        resolvedReports,
      },
      categoryStats,
      wardStats,
      monthlyStats,
      recentReports,
    });
  } catch (error) {
    next(error);
  }
};
