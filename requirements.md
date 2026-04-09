\# Implementation Plan: JobMatch AI

\## 1. Project Overview

This project has the main goal of evaluating the possibility of the user getting hired. The evaluation criteria is a provided CV and a job description. The evaluator will be a Large Language Model (LLM) and the final output will be a score from 0 to 10 with strong and weak sides of the candidadate based on the requirements and the CV.

\## 2. Tech Stack Requirements

\* \*\*Backend Framework:\*\* Python, FastAPI.

\* \*\*Frontend:\*\* HTML & Vanilla JavaScript.

\* \*\*Styling:\*\* Tailwind CSS.

\* \*\*LLM Provider:\*\* Cloudflare.

\* \*\*Target Model:\*\* \`\[BLANK / TO BE DETERMINED\]\`

\## 3. Practices to follow

\* \*\*At all times you should write pythonic code.

\* \*\*Do not have duplicate code blocks.

\* \*\*Do not have overwhelmingly large functions, only 50 lines and a single responsibility.

\* \*\*Have proper spacing inside of the different code blocks.

\* \*\*Have proper naming for each file, variable, method, etc - follow PEP-8 convention. Make sure the chosen names reflect the purpose of the given method or variable.

\* \*\*Make sure that there is no dead code inside of the project - all methods and files should have a clear purpose.

\* \*\*Be modular - make sure that each significant step of the plan is split into different files to have clean and readalbe code.

\* \*\*For sensitive data like API keys, utilize python-dotenv files to keep this information secure.

\* \*\*Do not include a comments regularly under every line, but have a well-thought docstring at the beggining of the file. They should describe the purpose of the file in the general pipeline.

\## 4. General Pipeline Structure

1\. \*\*Client Input (Frontend Phase 1):\*\* The landing page prompts the user to upload their CV.

\* Supported formats: \`.docx\` or \`.pdf\`.

\* Validation: If a valid file is provided, the 'Proceed' button becomes active. Otherwise, display an error message.

2\. \*\*Client Input (Frontend Phase 2):\*\* The user is transferred to a second view to paste the Job Description (JD).

\* Validation: Minimum of 50 characters.

\* Validation: Regex script must block URLs (e.g., checking if the string starts with \`http://\` or \`https://\`) to force pasted text, not links.

\* Action: Clicking 'Analyze' triggers the request.

3\. \*\*Client Request (Frontend -> Backend):\*\* JavaScript sends an asynchronous \`POST\` request. This payload must be \`multipart/form-data\` because it contains both the CV file and the plain-text JD.

4\. \*\*File Parsing & Validation (Backend):\*\* \* FastAPI receives the file and text.

\* The backend uses \`PyPDF2\` (or \`pdfminer.six\`) for PDFs, and \`python-docx\` for Word documents to extract raw string text from the uploaded file.

5\. \*\*Prompt Construction (Backend):\*\* The extracted CV text and the JD text are injected into a strict JSON-enforcing System Prompt featuring a predefined scoring algorithm.

6\. \*\*LLM API Call (Backend -> Cloudflare):\*\* Direct, authenticated HTTP request to the Cloudflare LLM endpoint.

7\. \*\*Response Parsing (Backend):\*\* Parses the raw string into a Python dictionary, handles JSON format errors, and returns a clean HTTP response.

8\. \*\*UI Render (Frontend):\*\* JavaScript dynamically updates the DOM to display the Final Score (0-10), a list of Strong Points, and a list of Weak Points.

\## 5. Scoring Algorithm & Prompt Engineering (Industry-Agnostic)

To guarantee consistency and objectivity across any profession (Tech, Marketing, Healthcare, Finance, etc.), the LLM will calculate the score based on a strict 10-point algorithmic rubric injected via the System Prompt.

\*\*Instructions for the AI Agent:\*\*

The agent must implement the system prompt exactly as written below. The prompt is designed to force the LLM to dynamically map the Job Description's requirements into four universal categories before scoring the CV.

\*\*The 10-Point Universal Rubric:\*\*

\* \*\*Core Competencies & Hard Skills (Max 4 points):\*\* Evaluates the exact practical, technical, or domain-specific skills required to perform the job (e.g., Python for a Developer, SEO for Marketing, Patient Triage for Nursing). +1 point for every 25% of core skills matched.

\* \*\*Experience & Progression (Max 3 points):\*\* Evaluates the years of experience, past job titles, and scope of responsibility. +3 for a perfect match or overqualification, +1.5 for partial match, +0 for severely lacking.

\* \*\*Soft Skills & Interpersonal Traits (Max 2 points):\*\* Evaluates communication, leadership, problem-solving, and adaptability as requested in the JD. +1 point for explicitly matched soft skills, +1 point for demonstrated industry context.

\* \*\*Education, Credentials & Baseline Requirements (Max 1 point):\*\* Evaluates degrees, language proficiencies, licenses, or specific certifications. +1 point if baseline requirements are met.