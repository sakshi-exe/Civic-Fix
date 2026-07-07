const reportService = require('../services/reportService');
const { successResponse, errorResponse } = require('../utils/response');

exports.createReport = async (req, res, next) => {
  try {
    const report = await reportService.createReport({
      ...req.body,
      reportedBy: req.user._id,
    });

    return successResponse(res, 'Report created successfully', { report }, 201);
  } catch (error) {
    next(error);
  }
};

exports.getReports = async (req, res, next) => {
  try {
    const result = await reportService.getReports(req.query, req.user);
    return successResponse(res, 'Reports fetched successfully', result);
  } catch (error) {
    next(error);
  }
};

exports.getReportById = async (req, res, next) => {
  try {
    const report = await reportService.getReportById(req.params.id, req.user);

    if (!report) {
      return errorResponse(res, 'Report not found', ['Report does not exist'], 404);
    }

    return successResponse(res, 'Report fetched successfully', { report });
  } catch (error) {
    next(error);
  }
};

exports.updateReport = async (req, res, next) => {
  try {
    const report = await reportService.updateReport(req.params.id, req.body, req.user);
    return successResponse(res, 'Report updated successfully', { report });
  } catch (error) {
    next(error);
  }
};

exports.deleteReport = async (req, res, next) => {
  try {
    await reportService.deleteReport(req.params.id);
    return successResponse(res, 'Report deleted successfully', {});
  } catch (error) {
    next(error);
  }
};
