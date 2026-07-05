const User = require('../models/User');
const Report = require('../models/Report');
const notificationService = require('../services/notificationService');
const { successResponse, errorResponse } = require('../utils/response');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return successResponse(res, 'Users fetched successfully', { users });
  } catch (error) {
    next(error);
  }
};

exports.assignMunicipality = async (req, res, next) => {
  try {
    const { reportId, assignedTo } = req.body;

    const report = await Report.findById(reportId);
    if (!report) {
      return errorResponse(res, 'Report not found', ['Report does not exist'], 404);
    }

    const municipality = await User.findById(assignedTo);
    if (!municipality || municipality.role !== 'municipality') {
      return errorResponse(res, 'Invalid municipality', ['Assigned user must be a municipality account'], 400);
    }

    report.assignedTo = municipality._id;
    report.status = 'assigned';
    report.timeline.push({ status: 'assigned', message: `Assigned to ${municipality.name}` });
    await report.save();

    await notificationService.createNotification({
      user: report.reportedBy,
      message: `Your report "${report.title}" was assigned to ${municipality.name}.`,
      type: 'status_update',
    });

    await notificationService.createNotification({
      user: municipality._id,
      message: `You were assigned report "${report.title}".`,
      type: 'system',
    });

    return successResponse(res, 'Municipality assigned successfully', { report });
  } catch (error) {
    next(error);
  }
};

exports.updateReportStatus = async (req, res, next) => {
  try {
    const { status, message } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return errorResponse(res, 'Report not found', ['Report does not exist'], 404);
    }

    report.status = status;
    report.timeline.push({ status, message: message || `Status updated to ${status}` });
    await report.save();

    await notificationService.createNotification({
      user: report.reportedBy,
      message: `Your report "${report.title}" status was updated to ${status}.`,
      type: 'status_update',
    });

    return successResponse(res, 'Report status updated successfully', { report });
  } catch (error) {
    next(error);
  }
};

exports.deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) {
      return errorResponse(res, 'Report not found', ['Report does not exist'], 404);
    }

    return successResponse(res, 'Report deleted successfully', {});
  } catch (error) {
    next(error);
  }
};

exports.getAdminAnalytics = async (req, res, next) => {
  try {
    const [totalReports, resolvedReports, pendingReports, usersCount] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ status: 'resolved' }),
      Report.countDocuments({ status: 'pending' }),
      User.countDocuments(),
    ]);

    return successResponse(res, 'Admin analytics fetched successfully', {
      totalReports,
      resolvedReports,
      pendingReports,
      usersCount,
    });
  } catch (error) {
    next(error);
  }
};
