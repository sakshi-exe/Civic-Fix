const Report = require('../models/Report');
const aiService = require('./aiService');
const notificationService = require('./notificationService');

class ReportService {
  async createReport(data) {
    const aiSummary = await aiService.generateSummary(data);
    const aiSeverity = await aiService.generateSeverity(data);

    const report = await Report.create({
      ...data,
      aiSummary,
      aiSeverity,
      timeline: [
        {
          status: 'pending',
          message: 'Report submitted successfully',
        },
      ],
    });

    await notificationService.createNotification({
      user: data.reportedBy,
      message: `Your report "${report.title}" was submitted successfully.`,
      type: 'system',
    });

    return report.populate('reportedBy', 'name email role');
  }

  async getReports(query = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};

    if (query.category) filter.category = query.category;
    if (query.status) filter.status = query.status;
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
        { ward: { $regex: query.search, $options: 'i' } },
      ];
    }

    const sortField = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate('reportedBy', 'name email role')
        .populate('assignedTo', 'name email role')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit),
      Report.countDocuments(filter),
    ]);

    return {
      reports,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getReportById(id) {
    return Report.findById(id).populate('reportedBy', 'name email role').populate('assignedTo', 'name email role');
  }

  async updateReport(id, updates, actor) {
    const report = await Report.findById(id);
    if (!report) {
      const error = new Error('Report not found');
      error.statusCode = 404;
      throw error;
    }

    const previousStatus = report.status;

    if (updates.status && updates.status !== previousStatus) {
      report.timeline.push({
        status: updates.status,
        message: `${actor?.name || 'System'} updated the status`,
      });
    }

    Object.assign(report, updates);
    await report.save();

    if (updates.status && updates.status !== previousStatus) {
      await notificationService.createNotification({
        user: report.reportedBy,
        message: `Your report "${report.title}" status was updated to ${updates.status}.`,
        type: 'status_update',
      });
    }

    return report.populate('reportedBy', 'name email role').populate('assignedTo', 'name email role');
  }

  async deleteReport(id) {
    const report = await Report.findByIdAndDelete(id);
    if (!report) {
      const error = new Error('Report not found');
      error.statusCode = 404;
      throw error;
    }

    return report;
  }
}

module.exports = new ReportService();
