const API_URL = "/api/v1/cv-sessions";
const MAX_FILE_SIZE_MB = 10;
const SESSION_CV_TOKEN_KEY = "jobmatch:cvSessionToken";
const SESSION_CV_FILE_NAME_KEY = "jobmatch:cvFileName";

const fileInput = document.getElementById("cv-file-input");
const dropZone = document.getElementById("cv-drop-zone");
const fileName = document.getElementById("cv-file-name");
const errorLabel = document.getElementById("cv-error");
const continueButton = document.getElementById("continue-button");
const statusLabel = document.getElementById("cv-status-label");

let selectedFile = null;

function isSupportedFile(file) {
    if (!file) {
        return false;
    }

    const fileNameValue = file.name.toLowerCase();
    return fileNameValue.endsWith(".pdf") || fileNameValue.endsWith(".docx");
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

function formatFileSize(bytes) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function showError(message) {
    errorLabel.textContent = message;
    errorLabel.classList.remove("hidden");
}

function clearError() {
    errorLabel.textContent = "";
    errorLabel.classList.add("hidden");
}

function updateSelection(file) {
    selectedFile = file;
    const validation = validateFile(file);
    continueButton.disabled = !validation.valid;

    if (!validation.valid) {
        fileName.textContent = "No file selected";
        statusLabel.textContent = "Waiting";
        if (file) {
            showError(validation.message);
        } else {
            clearError();
        }
        return;
    }

    clearError();
    fileName.textContent = `${file.name} • ${formatFileSize(file.size)}`;
    statusLabel.textContent = "Ready";
}

async function createCvSession() {
    const validation = validateFile(selectedFile);
    if (!validation.valid) {
        showError(validation.message);
        return;
    }

    continueButton.disabled = true;
    continueButton.textContent = "Uploading...";
    statusLabel.textContent = "Uploading";

    try {
        const formData = new FormData();
        formData.append("cv_file", selectedFile);

        const response = await fetch(API_URL, {
            method: "POST",
            body: formData,
        });

        const payload = await response.json();
        if (!response.ok) {
            const message = payload.detail || "Unable to upload the CV file.";
            throw new Error(message);
        }

        sessionStorage.setItem(SESSION_CV_TOKEN_KEY, payload.session_token);
        sessionStorage.setItem(SESSION_CV_FILE_NAME_KEY, payload.file_name || selectedFile.name);
        window.location.href = "job-description.html";
    } catch (error) {
        showError(error.message || "Unable to upload the CV file.");
        statusLabel.textContent = "Waiting";
        continueButton.disabled = false;
        continueButton.textContent = "Proceed to Job Description";
    }
}

fileInput.addEventListener("change", (event) => {
    const [file] = event.target.files;
    updateSelection(file || null);
});

dropZone.addEventListener("click", () => {
    fileInput.click();
});

dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("drag-over");
});

dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropZone.classList.remove("drag-over");

    const [file] = event.dataTransfer.files;
    if (!file) {
        return;
    }

    fileInput.files = event.dataTransfer.files;
    updateSelection(file);
});

continueButton.addEventListener("click", createCvSession);
updateSelection(null);
