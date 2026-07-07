const API_BASE_URL =
    window.CIVICFIX_API_BASE_URL ||
    window.localStorage.getItem("civicfix-api-base-url") ||
    "http://localhost:5001/api/v1";

const API = {
    auth: {
        login: `${API_BASE_URL}/auth/login`,
        register: `${API_BASE_URL}/auth/register`,
        me: `${API_BASE_URL}/auth/me`,
    },

    reports: `${API_BASE_URL}/reports`,

    dashboard: `${API_BASE_URL}/dashboard`,

    notifications: `${API_BASE_URL}/notifications`,

    upload: `${API_BASE_URL}/upload`,

    admin: `${API_BASE_URL}/admin`,
};
