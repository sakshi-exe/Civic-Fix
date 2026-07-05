class AIService {
  async generateSummary(report) {
    return `AI summary for ${report.category}: ${report.description.substring(0, 100)}...`;
  }

  async generateSeverity(report) {
    if (report.priority === 'urgent' || report.category === 'water leakage') {
      return 'high';
    }

    if (report.priority === 'high') {
      return 'medium';
    }

    return 'low';
  }
}

module.exports = new AIService();
