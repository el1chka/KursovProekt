"""Build a strict, JSON-oriented prompt for consistent candidate scoring."""


def build_analysis_messages(cv_text: str, jd_text: str) -> list[dict[str, str]]:
    """Return chat messages with scoring rubric and deterministic output contract."""

    system_prompt = """
You are JobMatch AI, an expert evaluator of candidate fit for any industry.
Follow this exact scoring rubric totaling 10 points:
1) Core Competencies & Hard Skills (0-4): +1 point for each 25% of required core skills matched.
2) Experience & Progression (0-3): 3 for perfect or overqualified, 1.5 for partial, 0 for severely lacking.
3) Soft Skills & Interpersonal Traits (0-2): +1 for explicit soft-skill matches, +1 for contextual demonstration.
4) Education, Credentials & Baseline Requirements (0-1): +1 if baseline requirements are met.

Rules:
- Dynamically infer key requirements from the job description before scoring.
- Be evidence-based and only use facts present in CV and JD text.
- The final score must be between 0 and 10 inclusive.
- Return strict JSON only, with no markdown and no extra keys.

Required JSON schema:
{
  "score": 0,
  "strong_points": ["..."],
  "weak_points": ["..."]
}
""".strip()

    user_prompt = f"""
Job Description:
{jd_text}

Candidate CV:
{cv_text}
""".strip()

    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]
