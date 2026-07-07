const AUTH_TOKEN_KEY = "civicfix-token";
const AUTH_USER_KEY = "civicfix-user";

const getToken = () => window.localStorage.getItem(AUTH_TOKEN_KEY);

const getUser = () => {
    try {
        return JSON.parse(window.localStorage.getItem(AUTH_USER_KEY) || "null");
    } catch (error) {
        return null;
    }
};

const setSession = (user, token) => {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
};

const clearSession = () => {
    window.localStorage.removeItem(AUTH_USER_KEY);
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
};

const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
});

const parseApiResponse = async (response) => {
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(result.message || "Request failed");
    }

    return result.data || {};
};

const requireAuth = async (expectedRole) => {
    const token = getToken();
    if (!token) {
        window.location.href = expectedRole === "admin" ? "admin-login.html" : "citizen-login.html";
        return null;
    }

    try {
        const response = await fetch(API.auth.me, {
            headers: authHeaders(),
        });
        const data = await parseApiResponse(response);
        const user = data.user;

        if (expectedRole && user.role !== expectedRole) {
            clearSession();
            window.location.href = expectedRole === "admin" ? "admin-login.html" : "citizen-login.html";
            return null;
        }

        window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        return user;
    } catch (error) {
        clearSession();
        window.location.href = expectedRole === "admin" ? "admin-login.html" : "citizen-login.html";
        return null;
    }
};

const statusClass = (status) => (status === "resolved" ? "resolved" : "");

const normalizeStatus = (status = "pending") =>
    status
        .split(" ")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

const escapeHtml = (value = "") =>
    String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
    }[character]));

const renderReports = (reports) => {
    const reportList = document.getElementById("report-list");
    if (!reportList) return;

    if (!reports.length) {
        reportList.innerHTML = `<div class="report-item"><div><strong>No reports yet</strong><p>New civic reports will appear here.</p></div></div>`;
        return;
    }

    reportList.innerHTML = reports
        .map((report) => `
            <div class="report-item">
                <div>
                    <strong>${escapeHtml(report.title)}</strong>
                    <p>${escapeHtml(report.address || report.ward || "Location not provided")}</p>
                </div>
                <span class="status-pill ${statusClass(report.status)}">${escapeHtml(normalizeStatus(report.status))}</span>
            </div>
        `)
        .join("");
};

const renderNotifications = (notifications) => {
    const notificationList = document.getElementById("notification-list");
    if (!notificationList) return;

    if (!notifications.length) {
        notificationList.innerHTML = `<div class="report-item"><div><strong>No notifications</strong><p>Status updates will appear here.</p></div></div>`;
        return;
    }

    notificationList.innerHTML = notifications
        .map((notification) => `
            <div class="report-item">
                <div>
                    <strong>${notification.type === "status_update" ? "Status update" : "CivicFix"}</strong>
                    <p>${escapeHtml(notification.message)}</p>
                </div>
            </div>
        `)
        .join("");
};

const updateCounts = ({ reports = [], notifications = [], totals = null }) => {
    const counts = totals || {
        totalReports: reports.filter((report) => report.status !== "resolved").length,
        pendingReports: reports.filter((report) => ["pending", "under review", "assigned"].includes(report.status)).length,
        resolvedReports: reports.filter((report) => report.status === "resolved").length,
    };

    const openCount = document.getElementById("open-count");
    const progressCount = document.getElementById("progress-count");
    const resolvedCount = document.getElementById("resolved-count");
    const notificationCount = document.getElementById("notification-count");

    if (openCount) openCount.textContent = counts.totalReports ?? 0;
    if (progressCount) progressCount.textContent = reports.filter((report) => report.status === "in progress").length || counts.pendingReports || 0;
    if (resolvedCount) resolvedCount.textContent = counts.resolvedReports ?? 0;
    if (notificationCount) notificationCount.textContent = notifications.length;
};

const loadCitizenDashboard = async () => {
    const user = await requireAuth("citizen");
    if (!user) return;

    const [reportsData, notificationsData] = await Promise.all([
        fetch(`${API.reports}?sortBy=createdAt&sortOrder=desc`, { headers: authHeaders() }).then(parseApiResponse),
        fetch(API.notifications, { headers: authHeaders() }).then(parseApiResponse),
    ]);

    const reports = reportsData.reports || [];
    const notifications = notificationsData.notifications || [];

    renderReports(reports);
    renderNotifications(notifications);
    updateCounts({ reports, notifications });
};

const loadAdminDashboard = async () => {
    const user = await requireAuth("admin");
    if (!user) return;

    const [overviewData, reportsData, notificationsData] = await Promise.all([
        fetch(`${API.dashboard}/overview`, { headers: authHeaders() }).then(parseApiResponse),
        fetch(`${API.reports}?sortBy=createdAt&sortOrder=desc&limit=8`, { headers: authHeaders() }).then(parseApiResponse),
        fetch(API.notifications, { headers: authHeaders() }).then(parseApiResponse),
    ]);

    const reports = reportsData.reports || overviewData.recentReports || [];
    const notifications = notificationsData.notifications || [];

    renderReports(reports);
    updateCounts({
        reports,
        notifications,
        totals: {
            totalReports: overviewData.totals?.totalReports || 0,
            pendingReports: overviewData.totals?.pendingReports || 0,
            resolvedReports: overviewData.totals?.resolvedReports || 0,
        },
    });
};

const wireAuthForms = () => {
    document.querySelectorAll("form.login-form").forEach((form) => {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const role = form.dataset.role;
            const email = form.querySelector('input[type="email"]').value.trim();
            const password = form.querySelector('input[type="password"]').value;
            const submitButton = form.querySelector('button[type="submit"]');

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Signing in...";
            }

            try {
                const response = await fetch(API.auth.login, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, role }),
                });
                const data = await parseApiResponse(response);

                setSession(data.user, data.token);
                window.location.href = role === "citizen" ? "citizen-dashboard.html" : "dashboard.html";
            } catch (error) {
                alert(error.message);
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = role === "citizen" ? "Open dashboard" : "Enter dashboard";
                }
            }
        });
    });

    document.querySelectorAll("form.register-form").forEach((form) => {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const submitButton = form.querySelector('button[type="submit"]');
            const payload = {
                name: form.querySelector('[name="name"]').value.trim(),
                email: form.querySelector('[name="email"]').value.trim(),
                password: form.querySelector('[name="password"]').value,
                phone: form.querySelector('[name="phone"]')?.value.trim() || "",
                role: form.dataset.role || "citizen",
            };

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "Creating...";
            }

            try {
                const response = await fetch(API.auth.register, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                const data = await parseApiResponse(response);

                setSession(data.user, data.token);
                window.location.href = "citizen-dashboard.html";
            } catch (error) {
                alert(error.message);
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = "Create account";
                }
            }
        });
    });
};

document.addEventListener("DOMContentLoaded", () => {
    wireAuthForms();

    document.querySelectorAll("[data-logout]").forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            clearSession();
            window.location.href = link.getAttribute("href") || "citizen-login.html";
        });
    });

    const page = document.body.dataset.page;
    if (page === "citizen-dashboard") {
        loadCitizenDashboard().catch((error) => alert(error.message));
    }

    if (page === "admin-dashboard") {
        loadAdminDashboard().catch((error) => alert(error.message));
    }
});
