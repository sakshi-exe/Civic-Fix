const Report = require('../models/Report');
const aiService = require('./aiService');
const notificationService = require('./notificationService');

class ReportService {
  getId(value) {
    return value?._id?.toString() || value?.toString();
  }

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

  buildAccessFilter(actor) {
    if (!actor || actor.role === 'admin') {
      return {};
    }

    if (actor.role === 'municipality') {
      return { assignedTo: actor._id };
    }

    return { reportedBy: actor._id };
  }

  canAccessReport(report, actor) {
    if (!actor || actor.role === 'admin') {
      return true;
    }

    if (actor.role === 'municipality') {
      return this.getId(report.assignedTo) === actor._id.toString();
    }

    return this.getId(report.reportedBy) === actor._id.toString();
  }

  async getReports(query = {}, actor) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = this.buildAccessFilter(actor);

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

  async getReportById(id, actor) {
    const report = await Report.findById(id).populate('reportedBy', 'name email role').populate('assignedTo', 'name email role');
    if (!report || !this.canAccessReport(report, actor)) {
      return null;
    }

    return report;
  }

  async updateReport(id, updates, actor) {
    const report = await Report.findById(id);
    if (!report) {
      const error = new Error('Report not found');
      error.statusCode = 404;
      throw error;
    }

    if (!this.canAccessReport(report, actor)) {
      const error = new Error('You do not have permission to update this report');
      error.statusCode = 403;
      throw error;
    }

    if (actor.role === 'citizen') {
      const allowedCitizenFields = ['title', 'description', 'category', 'image', 'latitude', 'longitude', 'address', 'ward', 'priority'];
      Object.keys(updates).forEach((key) => {
        if (!allowedCitizenFields.includes(key)) {
          delete updates[key];
        }
      });
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
