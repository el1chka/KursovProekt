# JobMatch AI

JobMatch AI evaluates how well a candidate fits a job opening by comparing:
- A candidate CV (PDF or DOCX)
- A pasted job description

The backend uses FastAPI and Cloudflare Workers AI to return:
- A fit score from 0 to 10
- Strong points
- Weak points

This repository currently contains the backend fundamentals. Frontend integration will follow.

## Why this project exists

Recruiters and candidates often need a quick, structured first-pass evaluation. JobMatch AI provides a transparent scoring format using a fixed 10-point rubric so the result is easier to interpret and compare.

## Core capabilities

- CV upload handling via multipart/form-data
- CV text extraction from PDF and DOCX files
- Job description validation (minimum length and URL blocking)
- Prompt generation with a strict universal scoring rubric
- Cloudflare Workers AI integration
- JSON-safe model response parsing
- Clean API response for frontend rendering

## Scoring rubric (0-10)

The model is instructed to score candidates using this breakdown:

- Core Competencies & Hard Skills: 0-4
- Experience & Progression: 0-3
- Soft Skills & Interpersonal Traits: 0-2
- Education, Credentials & Baseline Requirements: 0-1

Total: 10 points maximum

## Tech stack

- Python 3.12
- FastAPI
- httpx
- PyPDF2
- python-docx
- pydantic + pydantic-settings
- Uvicorn

## Project structure

```text
app/
	api/                # HTTP routes
	core/               # Config and custom exceptions
	schemas/            # Response models
	services/           # Parsing, prompting, AI orchestration
	utils/              # Utility helpers (JSON parsing)
	main.py             # FastAPI entrypoint
requirements.txt
.env                 # Local secrets (ignored by git)
```

## Quick start

### 1. Create and activate virtual environment

Windows PowerShell:

```powershell
python -m venv .venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

### 2. Install dependencies

```powershell
python -m pip install -r requirements.txt
```

### 3. Configure environment variables

Create or update .env in the project root:

```env
CF_AI_API_KEY=your_cloudflare_api_key
CF_ACCOUNT_ID=your_cloudflare_account_id
CF_MODEL=@cf/meta/llama-3.2-3b-instruct
REQUEST_TIMEOUT=30
```

### 4. Run the API

```powershell
python -m uvicorn app.main:app --reload
```

App will be available at:
- http://127.0.0.1:8000
- Interactive docs: http://127.0.0.1:8000/docs

## API overview

### Health check

- Method: GET
- Path: /health
- Response:

```json
{
	"status": "ok"
}
```

### Analyze candidate

- Method: POST
- Path: /api/v1/analyze
- Content-Type: multipart/form-data
- Fields:
	- cv_file: .pdf or .docx
	- jd_text: plain text, minimum 50 characters, must not start with http:// or https://

Sample response:

```json
{
	"score": 7.5,
	"strong_points": [
		"Strong match on Python and backend API development",
		"Relevant experience level for mid-level role"
	],
	"weak_points": [
		"Missing one requested certification",
		"Limited direct evidence of leadership examples"
	]
}
```

## Request example

```bash
curl -X POST "http://127.0.0.1:8000/api/v1/analyze" \
	-F "cv_file=@./sample_cv.pdf" \
	-F "jd_text=We are looking for a backend engineer with strong Python and FastAPI experience..."
```

## Security notes

- Never commit .env or API keys.
- Rotate any key immediately if it was exposed.
- Keep production keys separate from development keys.

## Current status and next milestones

Completed:
- Backend pipeline foundation
- Cloudflare model integration
- Validation and parsing workflow

Planned next:
- Frontend UI flow (CV upload, JD input, result rendering)
- End-to-end tests with sample CV fixtures
- Better observability (structured logs and metrics)

## License

This project is intended for educational and portfolio use unless specified otherwise.
