# JobMatch AI

JobMatch AI compares a candidate CV with a pasted job description and returns:
- Match score (0-10)
- Strong points
- Weak points

The backend is built with FastAPI and Cloudflare Workers AI.

## Workflow

Landing page -> CV upload -> Job description -> Results screen

## Tech stack

- Python 3.12
- FastAPI + Uvicorn
- Cloudflare Workers AI (via `httpx`)
- PyPDF2 + python-docx
- Pydantic + python-dotenv

## Quick start (works on another PC)

1. Create venv

```powershell
python -m venv .venv
```

2. Install dependencies (pinned in `requirements.txt`)

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

3. Create `.env` in project root

```env
CF_AI_API_KEY=your_cloudflare_api_key
CF_ACCOUNT_ID=your_cloudflare_account_id
CF_MODEL=@cf/meta/llama-3.2-3b-instruct
REQUEST_TIMEOUT=30
MAX_CV_FILE_SIZE_MB=10
CV_SESSION_TTL_MINUTES=120
```

4. Run app

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

## Local URLs

- API docs: http://127.0.0.1:8000/docs
- Landing: http://127.0.0.1:8000/ui/
- CV step: http://127.0.0.1:8000/ui/cv-upload.html
- JD step: http://127.0.0.1:8000/ui/job-description.html
- Results: http://127.0.0.1:8000/ui/results.html

## Main API routes

- `GET /health`
- `POST /api/v1/analyze` (direct CV + JD in one request)
- `POST /api/v1/cv-sessions` (upload CV for step-by-step flow)
- `POST /api/v1/analyze-session` (analyze with temporary CV session token)

## Notes

- `requirements.txt` uses fixed versions for reproducible installs.
- `.env` is ignored by git for key safety.
