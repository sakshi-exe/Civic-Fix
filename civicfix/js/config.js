// ===============================
// CivicFix API Configuration
// ===============================

const API_BASE_URL = "http://localhost:5001/api";

const API = {
    AUTH: {
        CITIZEN_LOGIN: `${API_BASE_URL}/auth/login`,
        ADMIN_LOGIN: `${API_BASE_URL}/auth/admin/login`,
        REGISTER: `${API_BASE_URL}/auth/register`
    },

    REPORTS: `${API_BASE_URL}/reports`,

    DASHBOARD: `${API_BASE_URL}/dashboard`,

    NOTIFICATIONS: `${API_BASE_URL}/notifications`
};