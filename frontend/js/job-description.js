const API_URL = "/api/v1/analyze-session";
const SESSION_CV_TOKEN_KEY = "jobmatch:cvSessionToken";
const SESSION_CV_FILE_NAME_KEY = "jobmatch:cvFileName";
const SESSION_RESULT_KEY = "jobmatch:lastResult";
const SESSION_SUBMISSION_KEY = "jobmatch:lastSubmission";

const jobDescInput = document.getElementById("job-desc");
const analyzeButton = document.getElementById("analyze-button");
const analysisStatus = document.getElementById("analysis-status");
const counter = document.getElementById("character-counter");

const cvToken = sessionStorage.getItem(SESSION_CV_TOKEN_KEY) || "";
const cvFileName = sessionStorage.getItem(SESSION_CV_FILE_NAME_KEY) || "Not loaded";

if (!cvToken) {
    window.location.href = "cv-upload.html";
}

function resetStatus() {
    analysisStatus.textContent = "";
}

function showStatus(message) {
    analysisStatus.textContent = message;
}

function validateJobDescription(text) {
    const trimmed = text.trim();

    if (trimmed.length < 50) {
        return { valid: false, message: "Job description must be at least 50 characters." };
    }

    if (/^\s*https?:\/\//i.test(trimmed)) {
        return { valid: false, message: "Paste plain text instead of a URL." };
    }

    return { valid: true, message: "" };
}

function updateCounter() {
    const length = jobDescInput.value.trim().length;
    counter.textContent = `${length} / 50`;

    counter.classList.toggle("text-error", length < 50);
    counter.classList.toggle("text-primary", length >= 50);
}

function saveSubmissionContext(jdText) {
    sessionStorage.setItem(
        SESSION_SUBMISSION_KEY,
        JSON.stringify({
            fileName: cvFileName,
            jdText: jdText.trim(),
            submittedAt: new Date().toISOString(),
        })
    );
}

async function submitAnalysis() {
    const validation = validateJobDescription(jobDescInput.value);
    if (!validation.valid) {
        showStatus(validation.message);
        return;
    }

    analyzeButton.disabled = true;
    analyzeButton.textContent = "Analyzing...";
    showStatus("Sending the CV session and job description to the backend...");

    try {
        const formData = new FormData();
        formData.append("cv_session_token", cvToken);
        formData.append("jd_text", jobDescInput.value.trim());

        const response = await fetch(API_URL, {
            method: "POST",
            body: formData,
        });

        const payload = await response.json();
        if (!response.ok) {
            const detail = Array.isArray(payload.detail)
                ? payload.detail.map((item) => item.msg || item.message || "Validation error").join(" ")
                : payload.detail || "The backend rejected the request.";
            throw new Error(detail);
        }

        sessionStorage.setItem(SESSION_RESULT_KEY, JSON.stringify(payload));
        saveSubmissionContext(jobDescInput.value);
        sessionStorage.removeItem(SESSION_CV_TOKEN_KEY);
        window.location.href = "results.html";
    } catch (error) {
        showStatus(error.message || "Unable to analyze the submission.");
    } finally {
        analyzeButton.disabled = false;
        analyzeButton.textContent = "Analyze Now";
    }
}

jobDescInput.addEventListener("input", () => {
    updateCounter();
    const validation = validateJobDescription(jobDescInput.value);
    if (validation.valid) {
        resetStatus();
    }
});

analyzeButton.addEventListener("click", submitAnalysis);
updateCounter();
showStatus(`CV loaded: ${cvFileName}`);
