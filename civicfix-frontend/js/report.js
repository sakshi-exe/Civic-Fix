/* Report page interactivity for CivicFix */

document.addEventListener("DOMContentLoaded", () => {
    const stages = Array.from(document.querySelectorAll(".report-stage"));
    const steps = Array.from(document.querySelectorAll(".stepper-bar .step"));
    const backButton = document.getElementById("back-button");
    const nextButton = document.getElementById("next-button");
    const previewText = document.getElementById("preview-text");
    const fileInput = document.getElementById("issue-media");
    const attachmentText = document.querySelector(".upload-card span");

    let activeIndex = 0;

    const authHeaders = (token) => ({
        Authorization: `Bearer ${token}`,
    });

    const parseApiResponse = async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            const message = result.errors?.[0] || result.message || "Request failed";
            throw new Error(message);
        }

        return result.data || {};
    };

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
            attachmentText.textContent = "Upload image";
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

        const token = window.localStorage.getItem("civicfix-token");
        if (!token) {
            alert("Please log in as a citizen before submitting a report.");
            window.location.href = "citizen-login.html";
            nextButton.textContent = "Submit Report";
            nextButton.disabled = false;
            return;
        }

        if (!description || description.length < 10) {
            alert("Please add a description with at least 10 characters.");
            nextButton.textContent = "Submit Report";
            nextButton.disabled = false;
            return;
        }

        if (!location && !landmark) {
            alert("Please provide the issue location or nearest landmark.");
            nextButton.textContent = "Submit Report";
            nextButton.disabled = false;
            return;
        }

        try {
            let image = "";

            if (fileInput.files.length) {
                const imageFile = fileInput.files[0];
                const uploadData = new FormData();
                uploadData.append("image", imageFile);

                const uploadResponse = await fetch(API.upload, {
                    method: "POST",
                    headers: authHeaders(token),
                    body: uploadData,
                });
                const uploadResult = await parseApiResponse(uploadResponse);
                image = uploadResult.imageUrl || "";
            }

            const payload = {
                title: title || "Citizen issue",
                description,
                category: category === "road" ? "pothole" : category === "sanitation" ? "garbage" : category === "water" ? "water leakage" : category === "streetlight" ? "streetlight" : category === "traffic" ? "traffic" : "other",
                latitude: 18.5204,
                longitude: 73.8567,
                address: location || landmark || "Location not provided",
                ward: landmark || "Unknown",
                priority: priority === "high" ? "high" : priority === "medium" ? "medium" : "low",
                image,
            };

            const response = await fetch(API.reports, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...authHeaders(token),
                },
                body: JSON.stringify(payload),
            });

            await parseApiResponse(response);

            window.location.href = "citizen-dashboard.html";
        } catch (error) {
            alert(error.message || "Report submission failed");
            nextButton.textContent = "Submit Report";
            nextButton.disabled = false;
        }
    });

    document.getElementById("issue-title").addEventListener("input", generatePreview);
    document.getElementById("issue-category").addEventListener("change", generatePreview);
    document.getElementById("issue-location").addEventListener("input", generatePreview);
    document.getElementById("issue-priority").addEventListener("change", generatePreview);
    fileInput.addEventListener("change", () => {
        if (fileInput.files.length && !fileInput.files[0].type.startsWith("image/")) {
            alert("Please upload an image file.");
            fileInput.value = "";
        }
        showAttachmentName();
    });

    updateStage();
    if (window.AOS) {
        AOS.init({
        duration: 800,
        once: true,
        easing: "ease-out-cubic"
        });
    }
});
