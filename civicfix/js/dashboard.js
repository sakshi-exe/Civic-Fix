/* Dashboard behavior for citizen and admin pages */

document.addEventListener("DOMContentLoaded", () => {
    const pageType = document.body.dataset.page;
    const REPORTS_KEY = "civicfix-reports";
    const NOTIFICATIONS_KEY = "civicfix-notifications";

    const getStorageJson = (key) => {
        const raw = window.localStorage.getItem(key);
        try {
            return raw ? JSON.parse(raw) : [];
        } catch (error) {
            return [];
        }
    };

    const saveStorageJson = (key, value) => {
        window.localStorage.setItem(key, JSON.stringify(value));
    };

    const sampleReports = [
        {
            id: "CF-1028",
            title: "Pothole near bus stop",
            status: "In Progress",
            progress: 60,
            category: "Road & Potholes",
            location: "Sector 12, MG Road",
            updated: "2 hours ago",
            image: null,
        },
        {
            id: "CF-1031",
            title: "Streetlight outage",
            status: "Open",
            progress: 28,
            category: "Streetlight",
            location: "Palm Avenue",
            updated: "1 day ago",
            image: null,
        },
        {
            id: "CF-1019",
            title: "Water leakage at park",
            status: "Resolved",
            progress: 100,
            category: "Water Supply",
            location: "Central Park",
            updated: "3 days ago",
            image: null,
        },
    ];

    const sampleNotifications = [
        {
            time: "Just now",
            message: "Your report CF-1028 has been assigned to the road maintenance team.",
        },
        {
            time: "4h ago",
            message: "New update: Streetlight outage CF-1031 is scheduled for repair tomorrow.",
        },
        {
            time: "1d ago",
            message: "Report CF-1019 has been marked resolved. Thank you for reporting.",
        },
    ];

    const ensureData = () => {
        const reports = getStorageJson(REPORTS_KEY);
        if (!reports.length) saveStorageJson(REPORTS_KEY, sampleReports);
        const notifications = getStorageJson(NOTIFICATIONS_KEY);
        if (!notifications.length) saveStorageJson(NOTIFICATIONS_KEY, sampleNotifications);
    };

    const buildReportCard = (report) => {
        return `
            <div class="report-item">
                <div>
                    <strong>${report.title}</strong>
                    <p>${report.category} • ${report.location}</p>
                    <p>${report.updated}</p>
                </div>
                <div class="report-progress">
                    <span class="status-pill ${report.status === "Resolved" ? "resolved" : report.status === "In Progress" ? "open" : ""}">${report.status}</span>
                    <div class="progress-bar">
                        <div style="width:${report.progress}%"></div>
                    </div>
                    ${report.image ? `<p class="attachment-pill">Attachment included</p>` : ""}
                </div>
            </div>
        `;
    };

    const buildNotification = (item) => {
        return `
            <div class="report-item notification-item">
                <div>
                    <strong>${item.message}</strong>
                    <p>${item.time}</p>
                </div>
            </div>
        `;
    };

    const populateCitizenDashboard = () => {
        ensureData();
        const reports = getStorageJson(REPORTS_KEY);
        const notifications = getStorageJson(NOTIFICATIONS_KEY);

        const openCountEl = document.getElementById("open-count");
        const progressCountEl = document.getElementById("progress-count");
        const resolvedCountEl = document.getElementById("resolved-count");
        const notificationCountEl = document.getElementById("notification-count");
        const reportList = document.getElementById("report-list");
        const notificationList = document.getElementById("notification-list");

        const summary = reports.reduce((acc, report) => {
            if (report.status === "Open") acc.open += 1;
            if (report.status === "In Progress") acc.progress += 1;
            if (report.status === "Resolved") acc.resolved += 1;
            return acc;
        }, { open: 0, progress: 0, resolved: 0 });

        openCountEl.textContent = summary.open;
        progressCountEl.textContent = summary.progress;
        resolvedCountEl.textContent = summary.resolved;
        notificationCountEl.textContent = notifications.length;

        reportList.innerHTML = reports.map(buildReportCard).join("");
        notificationList.innerHTML = notifications.map(buildNotification).join("");
    };

    const populateAdminDashboard = () => {
        ensureData();
        const reports = getStorageJson(REPORTS_KEY);
        const notifications = getStorageJson(NOTIFICATIONS_KEY);

        const openCountEl = document.getElementById("open-count");
        const progressCountEl = document.getElementById("progress-count");
        const resolvedCountEl = document.getElementById("resolved-count");
        const notificationCountEl = document.getElementById("notification-count");
        const reportList = document.getElementById("report-list");

        const summary = reports.reduce((acc, report) => {
            if (report.status === "Open") acc.open += 1;
            if (report.status === "In Progress") acc.progress += 1;
            if (report.status === "Resolved") acc.resolved += 1;
            return acc;
        }, { open: 0, progress: 0, resolved: 0 });

        openCountEl.textContent = summary.open;
        progressCountEl.textContent = summary.progress;
        resolvedCountEl.textContent = summary.resolved;
        notificationCountEl.textContent = notifications.length;

        if (reportList) {
            reportList.innerHTML = reports.map(buildReportCard).join("");
        }
    };

    if (pageType === "citizen-dashboard") {
        populateCitizenDashboard();
    }

    if (pageType === "admin-dashboard") {
        populateAdminDashboard();
    }

    if (document.querySelector("#citizen-login-form") || document.querySelector("#admin-login-form")) {
        document.querySelectorAll("form.login-form").forEach((form) => {
            form.addEventListener("submit", (event) => {
                event.preventDefault();
                const role = form.dataset.role;
                if (role === "citizen") {
                    window.location.href = "citizen-dashboard.html";
                } else {
                    window.location.href = "dashboard.html";
                }
            });
        });
    }

    if (pageType === "citizen-dashboard") {
        const actionButtons = document.querySelectorAll(".btn-primary, .btn-secondary");
        actionButtons.forEach((button) => {
            button.addEventListener("click", () => {
                if (button.textContent.includes("Sign Out")) {
                    window.location.href = "citizen-login.html";
                }
            });
        });
    }
});
