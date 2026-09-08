// Single source of truth for how interview answers are scored. Imported by the
// text-interview per-answer grader (/api/interview/feedback), the post-voice
// summariser (/api/interview/voice-summary), and the text-interview aggregate
// persister (/api/interview/complete) so the three never drift apart.

/** The 4x25 rubric, shared verbatim across every grader. */
export const INTERVIEW_RUBRIC = `SCORING RUBRIC (0-100):
- Relevance & specificity (25): directly answers the question with concrete detail, not generalities.
- Evidence & metrics (25): real examples, numbers, measurable outcomes, named tools/systems.
- Structure & clarity (25): organised, follows a logical or STAR flow, no rambling.
- Role alignment (25): shows the skills, depth, and judgement this specific role requires.`;

/** Score-band guidance. */
export const SCORING_GUIDELINES = `SCORING GUIDELINES:
- 85-100: Exceptional - specific, metrics-driven, tightly aligned to the role.
- 70-84 : Strong - good examples but thin on metrics or depth.
- 50-69 : Average - relevant but vague, missing concrete evidence.
- 30-49 : Weak - too generic, no real examples.
- 0-29  : Poor - off-topic, far too brief, or no substance.`;

/** Anti-generosity + output-quality rules. */
export const SCORING_RULES = `STRICT RULES:
- Do NOT be generous. A vague answer with no specific example scores below 55.
- "strengths" must cite something SPECIFIC the candidate actually said - never generic praise.
- "improvements" must be ACTIONABLE and concrete - never just "add more detail".
- Pin down ownership: an answer that hides behind "we" without saying what the candidate personally did is not strong.`;

/** Everything a grader prompt needs, in one block. */
export const RUBRIC_BLOCK = `${INTERVIEW_RUBRIC}

${SCORING_GUIDELINES}

${SCORING_RULES}`;
