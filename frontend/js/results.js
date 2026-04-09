const SESSION_RESULT_KEY = "jobmatch:lastResult";
const SESSION_SUBMISSION_KEY = "jobmatch:lastSubmission";
const SESSION_CV_TOKEN_KEY = "jobmatch:cvSessionToken";
const SESSION_CV_FILE_NAME_KEY = "jobmatch:cvFileName";

const scoreValue = document.getElementById("score-value");
const scoreRing = document.getElementById("score-ring");
const scoreBadge = document.getElementById("score-badge");
const scoreBadgeLabel = document.getElementById("score-badge-label");
const insightText = document.getElementById("insight-text");
const insightTags = document.getElementById("insight-tags");
const strongPointsList = document.getElementById("strong-points-list");
const weakPointsList = document.getElementById("weak-points-list");
const reportId = document.getElementById("report-id");
const reportSummary = document.getElementById("report-summary");
const submissionTitle = document.getElementById("submission-title");
const submissionSubtitle = document.getElementById("submission-subtitle");
const submissionPreview = document.getElementById("submission-preview");
const submissionFile = document.getElementById("submission-file");
const submissionJdLength = document.getElementById("submission-jd-length");
const strongCount = document.getElementById("metric-strong-count");
const weakCount = document.getElementById("metric-weak-count");
const tryAnotherButton = document.getElementById("apply-button");
const downloadButtons = [document.getElementById("download-report-button"), document.getElementById("download-report-button-2")];
const recommendationsButton = document.getElementById("recommendations-button");

const resultData = readSessionJson(SESSION_RESULT_KEY) || {
    score: 0,
    strong_points: [],
    weak_points: [],
};
const submissionData = readSessionJson(SESSION_SUBMISSION_KEY) || {
    fileName: "No file loaded",
    jdText: "",
    submittedAt: new Date().toISOString(),
};

function readSessionJson(key) {
    const rawValue = sessionStorage.getItem(key);
    if (!rawValue) {
        return null;
    }

    try {
        return JSON.parse(rawValue);
    } catch {
        return null;
    }
}

function createStrongPointItem(text) {
    const item = document.createElement("li");
    item.className = "flex items-start gap-4";
    item.innerHTML = `
        <span class="material-symbols-outlined text-tertiary mt-1" style="font-variation-settings: 'FILL' 1;">check_circle</span>
        <div>
            <span class="font-bold block text-on-surface">${escapeHtml(text)}</span>
            <span class="text-sm text-on-surface-variant leading-snug">Identified as a positive match from the uploaded CV and pasted job description.</span>
        </div>
    `;
    return item;
}

function createWeakPointItem(text) {
    const item = document.createElement("li");
    item.className = "flex items-start gap-4";
    item.innerHTML = `
        <span class="material-symbols-outlined text-error mt-1" style="font-variation-settings: 'FILL' 1;">error_outline</span>
        <div>
            <span class="font-bold block text-on-surface text-opacity-80">${escapeHtml(text)}</span>
            <span class="text-sm text-on-surface-variant leading-snug">This is an area the model flagged for improvement.</span>
        </div>
    `;
    return item;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function formatScore(value) {
    return Number(value).toFixed(1);
}

function getBadgeLabel(score) {
    if (score >= 8) {
        return "STRONG FIT";
    }

    if (score >= 5) {
        return "MODERATE FIT";
    }

    return "NEEDS IMPROVEMENT";
}

function getInsightText(score, strongPoints, weakPoints) {
    if (!strongPoints.length && !weakPoints.length) {
        return "No report data was found in session storage. Please go back and submit a CV and job description.";
    }

    if (score >= 8) {
        return `Your profile scored ${formatScore(score)}/10 and shows a strong overall fit. The model found clear alignment in the areas below.`;
    }

    if (score >= 5) {
        return `Your profile scored ${formatScore(score)}/10. The model identified meaningful alignment, but also a few gaps that are worth addressing.`;
    }

    return `Your profile scored ${formatScore(score)}/10. The model found some useful strengths, but the job description signals several missing requirements.`;
}

function getInsightTags(strongPoints) {
    return strongPoints.slice(0, 3).map((point) => point.split(/[.,;:]/)[0]).filter(Boolean);
}

function renderTags(tags) {
    insightTags.innerHTML = "";
    if (!tags.length) {
        const emptyTag = document.createElement("span");
        emptyTag.className = "bg-secondary-container text-on-secondary-container text-xs font-semibold px-3 py-1 rounded-full";
        emptyTag.textContent = "No tags available";
        insightTags.appendChild(emptyTag);
        return;
    }

    tags.forEach((tag) => {
        const chip = document.createElement("span");
        chip.className = "bg-secondary-container text-on-secondary-container text-xs font-semibold px-3 py-1 rounded-full";
        chip.textContent = tag;
        insightTags.appendChild(chip);
    });
}

function renderLists(strongPoints, weakPoints) {
    strongPointsList.innerHTML = "";
    weakPointsList.innerHTML = "";

    if (!strongPoints.length) {
        const emptyStrong = document.createElement("li");
        emptyStrong.className = "text-sm text-on-surface-variant";
        emptyStrong.textContent = "No strong points were returned by the model.";
        strongPointsList.appendChild(emptyStrong);
    } else {
        strongPoints.forEach((point) => strongPointsList.appendChild(createStrongPointItem(point)));
    }

    if (!weakPoints.length) {
        const emptyWeak = document.createElement("li");
        emptyWeak.className = "text-sm text-on-surface-variant";
        emptyWeak.textContent = "No weak points were returned by the model.";
        weakPointsList.appendChild(emptyWeak);
    } else {
        weakPoints.forEach((point) => weakPointsList.appendChild(createWeakPointItem(point)));
    }
}

function setScoreRing(score) {
    const circumference = 527;
    const safeScore = Math.max(0, Math.min(10, Number(score) || 0));
    const offset = circumference - (safeScore / 10) * circumference;
    scoreRing.setAttribute("stroke-dashoffset", String(offset));
}

function renderReport() {
    const score = Number(resultData.score) || 0;
    const strongPoints = Array.isArray(resultData.strong_points) ? resultData.strong_points : [];
    const weakPoints = Array.isArray(resultData.weak_points) ? resultData.weak_points : [];
    const tags = getInsightTags(strongPoints);

    reportId.textContent = `Match Report #${new Date().getTime().toString().slice(-5)}`;
    scoreValue.textContent = formatScore(score);
    scoreBadgeLabel.textContent = getBadgeLabel(score);
    reportSummary.textContent = getInsightText(score, strongPoints, weakPoints);
    insightText.textContent = getInsightText(score, strongPoints, weakPoints);
    strongCount.textContent = String(strongPoints.length);
    weakCount.textContent = String(weakPoints.length);
    setScoreRing(score);
    renderTags(tags);
    renderLists(strongPoints, weakPoints);

    submissionTitle.textContent = submissionData.fileName ? "Your Uploaded CV and Job Description" : "No Submission Loaded";
    submissionSubtitle.textContent = score > 0 ? "Backend analysis complete" : "Waiting for a new analysis";
    submissionPreview.textContent = submissionData.jdText
        ? submissionData.jdText.slice(0, 220)
        : "The report below is generated directly from the uploaded CV and pasted job description.";
    submissionFile.textContent = submissionData.fileName || "Not loaded";
    submissionJdLength.textContent = `${submissionData.jdText ? submissionData.jdText.length : 0} chars`;
}

function clearSessionAndReturn() {
    sessionStorage.removeItem(SESSION_RESULT_KEY);
    sessionStorage.removeItem(SESSION_SUBMISSION_KEY);
    sessionStorage.removeItem(SESSION_CV_TOKEN_KEY);
    sessionStorage.removeItem(SESSION_CV_FILE_NAME_KEY);
    window.location.href = "cv-upload.html";
}

function bindActions() {
    downloadButtons.forEach((button) => {
        if (!button) {
            return;
        }

        button.addEventListener("click", () => {
            window.print();
        });
    });

    tryAnotherButton.addEventListener("click", clearSessionAndReturn);
    recommendationsButton.addEventListener("click", () => {
        window.location.href = "index.html#analysis";
    });
}

renderReport();
bindActions();
