const API_URL = "/api/v1/analyze";
const MAX_FILE_SIZE_MB = 10;
const SESSION_RESULT_KEY = "jobmatch:lastResult";
const SESSION_SUBMISSION_KEY = "jobmatch:lastSubmission";

const cvInput = document.getElementById("cv-file");
const cvName = document.getElementById("cv-file-name");
const cvError = document.getElementById("cv-error");
const proceedButton = document.getElementById("proceed-button");
const jdStep = document.getElementById("jd-step");
const jdText = document.getElementById("jd-text");
const jdError = document.getElementById("jd-error");
const analyzeButton = document.getElementById("analyze-button");
const analysisStatus = document.getElementById("analysis-status");
const cvCard = document.getElementById("cv-card");
const proceedToJd = document.getElementById("proceed-button");

let selectedFile = null;

function formatFileSize(bytes) {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
}

function resetError(element) {
    element.textContent = "";
    element.classList.add("hidden");
}

function showError(element, message) {
    element.textContent = message;
    element.classList.remove("hidden");
}

function isSupportedFile(file) {
    if (!file) {
        return false;
    }

    const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const allowedExtensions = [".pdf", ".docx"];
    const fileName = file.name.toLowerCase();

    return allowedTypes.includes(file.type) || allowedExtensions.some((extension) => fileName.endsWith(extension));
}

function validateFile(file) {
    if (!file) {
        return { valid: false, message: "Please select a CV file." };
    }

    if (!isSupportedFile(file)) {
        return { valid: false, message: "Only PDF and DOCX files are supported." };
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        return { valid: false, message: `CV file must be smaller than ${MAX_FILE_SIZE_MB} MB.` };
    }

    return { valid: true, message: "" };
}

function updateProceedState() {
    const validation = validateFile(selectedFile);
    proceedButton.disabled = !validation.valid;

    if (validation.valid) {
        resetError(cvError);
        cvName.textContent = `${selectedFile.name} • ${formatFileSize(selectedFile.size)}`;
    } else {
        cvName.textContent = "No file selected";
        if (selectedFile) {
            showError(cvError, validation.message);
        }
    }
}

function setSelectedFile(file) {
    selectedFile = file;
    updateProceedState();
}

function revealJdStep() {
    jdStep.classList.remove("hidden");
    jdStep.scrollIntoView({ behavior: "smooth", block: "start" });
    jdText.focus({ preventScroll: true });
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

function setLoading(isLoading) {
    analyzeButton.disabled = isLoading;
    analyzeButton.textContent = isLoading ? "Analyzing..." : "Analyze";
    analysisStatus.textContent = isLoading ? "Sending your CV and job description to the backend..." : "";
}

function saveSubmissionContext() {
    const submission = {
        fileName: selectedFile?.name || "",
        jdText: jdText.value.trim(),
        submittedAt: new Date().toISOString(),
    };

    sessionStorage.setItem(SESSION_SUBMISSION_KEY, JSON.stringify(submission));
}

async function submitAnalysis() {
    const jdValidation = validateJobDescription(jdText.value);
    if (!jdValidation.valid) {
        showError(jdError, jdValidation.message);
        return;
    }

    resetError(jdError);
    setLoading(true);

    try {
        const formData = new FormData();
        formData.append("cv_file", selectedFile);
        formData.append("jd_text", jdText.value.trim());

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
        saveSubmissionContext();
        window.location.href = "results.html";
    } catch (error) {
        showError(jdError, error.message || "Unable to analyze the submission.");
        analysisStatus.textContent = "";
    } finally {
        setLoading(false);
    }
}

cvInput.addEventListener("change", (event) => {
    const [file] = event.target.files;
    setSelectedFile(file || null);
});

cvCard.addEventListener("dragover", (event) => {
    event.preventDefault();
    cvCard.classList.add("drag-over");
});

cvCard.addEventListener("dragleave", () => {
    cvCard.classList.remove("drag-over");
});

cvCard.addEventListener("drop", (event) => {
    event.preventDefault();
    cvCard.classList.remove("drag-over");
    const [file] = event.dataTransfer.files;
    if (file) {
        cvInput.files = event.dataTransfer.files;
        setSelectedFile(file);
    }
});

proceedToJd.addEventListener("click", () => {
    const validation = validateFile(selectedFile);
    if (!validation.valid) {
        showError(cvError, validation.message);
        return;
    }

    resetError(cvError);
    revealJdStep();
});

jdText.addEventListener("input", () => {
    if (jdError.textContent) {
        const validation = validateJobDescription(jdText.value);
        if (validation.valid) {
            resetError(jdError);
        }
    }
});

analyzeButton.addEventListener("click", submitAnalysis);
updateProceedState();
