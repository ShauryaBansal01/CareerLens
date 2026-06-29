const fs = require('fs');
const path = require('path');
const { callGeminiWithRetry, stripCodeFences } = require('../utils/retryWithBackoff');

// ── Single source of truth for LaTeX template specification ─────────────────
const LATEX_INSTRUCTIONS = fs.readFileSync(
  path.join(__dirname, '..', 'utils', 'latexPromptInstructions.txt'),
  'utf-8'
);

/**
 * Generates a clean, ATS-friendly LaTeX resume from raw resume text.
 * Optionally accepts a structured UserProfile for higher-quality output.
 *
 * @param {string} resumeText - The raw extracted text from the PDF
 * @param {Object} [structuredProfile] - Optional UserProfile document (basics, experience, education, projects, skills)
 * @returns {Promise<string>} The generated LaTeX code
 */
exports.generateBaseLatex = async (resumeText, structuredProfile = null) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

    // ── Build the data context ────────────────────────────────────────────
    let dataSection = '';

    if (structuredProfile) {
      // Prefer structured data — gives the AI cleaner input than raw OCR text
      const profileJson = JSON.stringify({
        basics: structuredProfile.basics || {},
        skills: structuredProfile.skills || [],
        experience: structuredProfile.experience || [],
        education: structuredProfile.education || [],
        projects: structuredProfile.projects || [],
      }, null, 2);

      dataSection = `
STRUCTURED PROFILE DATA (JSON — prefer this over raw text when available):
${profileJson}

RAW RESUME TEXT (use as fallback for any data missing from the JSON above):
${resumeText.substring(0, 8000)}`;
    } else {
      dataSection = `
USER RESUME TEXT:
${resumeText.substring(0, 12000)}`;
    }

    const prompt = `${LATEX_INSTRUCTIONS}

Your task is to generate a complete, compilable LaTeX resume from the provided candidate data.

${dataSection}

ADDITIONAL INSTRUCTIONS:
1. Parse and identify: Name, Contact Info (Email, Phone, LinkedIn, GitHub), Education, Experience, Projects, and Skills.
2. Use the exact formatting rules from the template specification above. Do NOT define custom macros.
3. Order sections logically: Header → Education → Experience → Projects → Skills (or Experience → Education if the candidate has significant work history).
4. For bullet points under Experience and Projects, use action verbs and include quantifiable metrics where the data supports it.
5. If a section has NO data (e.g., no projects found), OMIT that section entirely — do not output empty headers or placeholder text.
6. Ensure proper escaping of LaTeX special characters (&, %, $, #, _, {, }, ~, ^, \\).
7. The output MUST compile cleanly with pdflatex without any errors.
8. Start output immediately with \\documentclass. Do NOT output any markdown blocks or explanatory text.`;

    const response = await callGeminiWithRetry(apiKey, { contents: prompt });
    return stripCodeFences(response.text);
  } catch (error) {
    console.error('Error generating base LaTeX:', error);
    throw new Error('Failed to generate base LaTeX');
  }
};

/**
 * Tailors an existing LaTeX resume to a specific Job Description.
 * Uses a structured two-phase prompt: first extract JD requirements,
 * then apply them to rewrite the resume for maximum ATS alignment.
 *
 * @param {string} baseLatex - The candidate's existing LaTeX resume code
 * @param {string} jobDescription - The target job description text
 * @param {Array<string>} [userSkills=[]] - Optional array of the user's known skills for context
 * @returns {Promise<string>} The tailored LaTeX code
 */
exports.tailorLatex = async (baseLatex, jobDescription, userSkills = []) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

    const skillsContext = userSkills.length > 0
      ? `\nCANDIDATE'S KNOWN SKILLS (for reference — emphasize matches, weave in gaps subtly):\n${userSkills.join(', ')}\n`
      : '';

    const prompt = `${LATEX_INSTRUCTIONS}

You are an expert career coach, technical recruiter, and LaTeX developer. Your task is to tailor the candidate's existing LaTeX resume to maximize their chances of passing ATS screening and getting an interview for the target role.

TARGET JOB DESCRIPTION:
"""
${jobDescription.substring(0, 5000)}
"""

CANDIDATE'S CURRENT LATEX RESUME:
"""
${baseLatex}
"""
${skillsContext}
STEP 1 — MENTAL ANALYSIS (do this internally, do NOT output this):
- Extract the top 8-10 hard skills, technologies, and frameworks required by the JD.
- Identify 3-5 key responsibilities and desired outcomes.
- Note any specific buzzwords, certifications, or methodologies mentioned.
- Compare against the candidate's current resume content to find gaps and overlaps.

STEP 2 — TAILORING (output ONLY this):
Apply your analysis to rewrite the resume following these rules:

1. EXPERIENCE & PROJECTS — Rewrite bullet points using the STAR method (Situation, Task, Action, Result):
   - Incorporate JD keywords naturally into existing accomplishments.
   - Emphasize quantifiable impact (%, $, time saved, scale handled).
   - Lead every bullet with a strong action verb (Engineered, Optimized, Architected, Spearheaded, etc.).
   - Keep strictly 3-4 bullet points per role/project. Be concise.

2. SKILLS SECTION — Reorder to put the most JD-relevant skills first. Group logically (Languages, Frameworks, Tools, etc.).

3. SECTION ORDERING — If the JD emphasizes experience over education, put Experience first. If it's an entry-level/academic role, Education first.

4. ATS OPTIMIZATION — Maximize keyword density for the specific JD without keyword-stuffing. Use the exact phrasing from the JD when it naturally fits.

5. SUMMARY/OBJECTIVE — If one exists, rewrite it to directly address this specific role. If none exists, do NOT add one.

6. INTEGRITY — Do NOT invent fake jobs, degrees, companies, or skills. You may only rephrase and re-emphasize existing real experience.

7. FORMATTING — Preserve the exact LaTeX formatting rules from the template specification above. Do NOT define custom macros. Ensure the output compiles cleanly with pdflatex.

8. Return ONLY the complete, valid tailored LaTeX code. Start with \\documentclass and end with \\end{document}. No markdown blocks.`;

    const response = await callGeminiWithRetry(apiKey, { contents: prompt });
    return stripCodeFences(response.text);
  } catch (error) {
    console.error('Error tailoring LaTeX:', error);
    throw new Error('Failed to tailor LaTeX resume');
  }
};
