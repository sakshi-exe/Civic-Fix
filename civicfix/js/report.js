/* Report page interactivity for CivicFix */

document.addEventListener("DOMContentLoaded", () => {
    const stages = Array.from(document.querySelectorAll(".report-stage"));
    const steps = Array.from(document.querySelectorAll(".stepper-bar .step"));
    const backButton = document.getElementById("back-button");
    const nextButton = document.getElementById("next-button");
    const previewText = document.getElementById("preview-text");
    const fileInput = document.getElementById("issue-media");
    const attachmentText = document.querySelector(".upload-card span");
    const REPORTS_KEY = "civicfix-reports";
    const NOTIFICATIONS_KEY = "civicfix-notifications";

    let activeIndex = 0;

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

    const readImageData = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

    const updateStage = () => {
        stages.forEach((stage, index) => {
            stage.classList.toggle("hidden", index !== activeIndex);
        });
        steps.forEach((step, index) => {
            step.classList.toggle("active", index === activeIndex);
            step.classList.toggle("completed", index < activeIndex);
        });
        backButton.disabled = activeIndex === 0;
        nextButton.textContent = activeIndex === stages.length - 1 ? "Submit Report" : "Continue";
    };

    const generatePreview = () => {
        const title = document.getElementById("issue-title").value.trim();
        const category = document.getElementById("issue-category").value;
        const location = document.getElementById("issue-location").value.trim();
        const priority = document.getElementById("issue-priority").value;

        if (!title && !location) {
            previewText.textContent = "CivicFix will analyze your report and generate a clean summary ready for municipal review.";
            return;
        }

        const categoryText = {
            road: "Road & Potholes",
            sanitation: "Sanitation",
            water: "Water Supply",
            streetlight: "Streetlight",
            traffic: "Traffic & Signals"
        }[category];

        previewText.textContent = `Issue: ${title || "Untitled issue"}. Category: ${categoryText}. Priority: ${priority}. Location: ${location || "Location pending"}. CivicFix will craft a clear summary for faster handling.`;
    };

    const showAttachmentName = () => {
        if (fileInput.files.length) {
            attachmentText.textContent = `Attached file: ${fileInput.files[0].name}`;
        } else {
            attachmentText.textContent = "Upload image or video";
        }
    };

    backButton.addEventListener("click", () => {
        if (activeIndex > 0) {
            activeIndex -= 1;
            updateStage();
        }
    });

    nextButton.addEventListener("click", async () => {
        if (activeIndex < stages.length - 1) {
            activeIndex += 1;
            updateStage();
            if (activeIndex === stages.length - 1) {
                generatePreview();
            }
            return;
        }

        nextButton.textContent = "Submitting...";
        nextButton.disabled = true;

        const title = document.getElementById("issue-title").value.trim();
        const category = document.getElementById("issue-category").value;
        const description = document.getElementById("issue-description").value.trim();
        const location = document.getElementById("issue-location").value.trim();
        const priority = document.getElementById("issue-priority").value;
        const landmark = document.getElementById("location-landmark").value.trim();

        let attachment = null;
        if (fileInput.files.length) {
            attachment = await readImageData(fileInput.files[0]);
        }

        const report = {
            id: `CF-${Math.floor(1000 + Math.random() * 9000)}`,
            title: title || "Citizen issue",
            category,
            description,
            location: location || landmark || "Location not provided",
            priority,
            status: "Open",
            progress: 12,
            updated: "Just now",
            created: new Date().toISOString(),
            image: attachment,
        };

        const reports = getStorageJson(REPORTS_KEY);
        reports.unshift(report);
        saveStorageJson(REPORTS_KEY, reports);

        const notifications = getStorageJson(NOTIFICATIONS_KEY);
        notifications.unshift({
            time: "Just now",
            message: `Your complaint ${report.id} has been received and is in review.`
        });
        saveStorageJson(NOTIFICATIONS_KEY, notifications);

        setTimeout(() => {
            window.location.href = "citizen-dashboard.html";
        }, 800);
    });

    document.getElementById("issue-title").addEventListener("input", generatePreview);
    document.getElementById("issue-category").addEventListener("change", generatePreview);
    document.getElementById("issue-location").addEventListener("input", generatePreview);
    document.getElementById("issue-priority").addEventListener("change", generatePreview);
    fileInput.addEventListener("change", showAttachmentName);

    updateStage();
    AOS.init({
        duration: 800,
        once: true,
        easing: "ease-out-cubic"
    });
});
