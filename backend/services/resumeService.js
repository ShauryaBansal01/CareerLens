const fs = require('fs');
const path = require('path');
const { callGeminiWithRetry, stripCodeFences, sanitizeLatexCode } = require('../utils/retryWithBackoff');

const TEMPLATES_DIR = path.join(__dirname, '..', 'utils', 'templates');

const FEW_SHOT_EXAMPLES = `
EXAMPLE STRONG BULLET POINTS (use this style):
- Engineered a distributed payment processing system handling $2M+ monthly transactions, reducing settlement time by 60% through async queue optimization
- Designed and implemented 12 RESTful microservices serving 50K+ daily active users with 99.95% uptime
- Led a cross-functional team of 5 engineers to migrate a monolithic application to AWS ECS, cutting infrastructure costs by 40%
- Optimized database query performance through strategic indexing and caching, reducing p95 latency from 800ms to 120ms
- Built an automated CI/CD pipeline using GitHub Actions and Terraform, decreasing deployment time from 45min to 8min
`;

const MULTI_PASS_REVIEW_PROMPT = `
You are an expert Resume Quality Reviewer. Review the LaTeX resume generated in the previous pass and provide specific, actionable improvement suggestions.

Check for:
1. Weak or generic bullet points lacking metrics
2. Missing action verbs or passive voice
3. Inconsistent formatting or spacing
4. Opportunities to better quantify achievements
5. Any LaTeX syntax issues that would prevent compilation

Return EXACTLY this JSON (no markdown):
{
  "strengths": ["strength1"],
  "weaknesses": [{"issue": "description", "location": "section name", "suggestion": "how to fix"}],
  "shouldRegenerate": true/false,
  "specificInstructions": "Detailed instructions for what to improve in the next pass"
}
`;

function getTemplateInstructions() {
  return fs.readFileSync(path.join(__dirname, '..', 'utils', 'latexPromptInstructions.txt'), 'utf-8');
}

exports.generateBaseLatex = async (resumeText, structuredProfile = null, options = {}) => {
  const { useMultiPass = true, useProModel = false } = options;
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

    const LATEX_INSTRUCTIONS = getTemplateInstructions();

    let dataSection = '';

    if (structuredProfile) {
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

    let prompt = `${LATEX_INSTRUCTIONS}

${FEW_SHOT_EXAMPLES}

Your task is to generate a complete, compilable LaTeX resume from the provided candidate data.

${dataSection}

ADDITIONAL INSTRUCTIONS:
1. Parse and identify: Name, Contact Info (Email, Phone, LinkedIn, GitHub), Education, Experience, Projects, and Skills.
2. Use the exact formatting rules from the template specification above. Do NOT define custom macros.
3. Order sections logically: Header → Education → Experience → Projects → Skills (or Experience → Education if the candidate has significant work history).
4. For bullet points under Experience and Projects, use the EXAMPLE STRONG BULLET POINTS above as a style guide. Each bullet MUST include an action verb and a quantifiable metric.
5. If a section has NO data (e.g., no projects found), OMIT that section entirely — do not output empty headers or placeholder text.
6. Ensure proper escaping of LaTeX special characters (&, %, $, #, _, {, }, ~, ^, \\\\).
7. The output MUST compile cleanly with pdflatex without any errors.
8. Start output immediately with \\\\documentclass. Do NOT output any markdown blocks or explanatory text.`;

    const model = useProModel ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    let latexCode = '';

    if (useMultiPass) {
      // Pass 1: Generate initial LaTeX
      const response1 = await callGeminiWithRetry(apiKey, { contents: prompt }, { model });
      latexCode = sanitizeLatexCode(stripCodeFences(response1.text));

      // Pass 2: AI self-review
      const reviewPrompt = `${MULTI_PASS_REVIEW_PROMPT}

GENERATED LATEX RESUME:
${latexCode}`;

      try {
        const response2 = await callGeminiWithRetry(apiKey, {
          contents: reviewPrompt,
          config: { responseMimeType: "application/json" }
        }, { model });

        const review = JSON.parse(response2.text);

        if (review.shouldRegenerate && review.specificInstructions) {
          // Pass 3: Refine based on review
          const refinePrompt = `${LATEX_INSTRUCTIONS}

${FEW_SHOT_EXAMPLES}

${dataSection}

PREVIOUS VERSION (review found issues to fix):
"""
${latexCode.substring(0, 6000)}
"""

REVIEW FEEDBACK TO ADDRESS:
${review.specificInstructions}

CRITICAL: Fix ALL issues mentioned above. Apply the specific instructions. Use strong action verbs and metrics in every bullet. Return ONLY the valid LaTeX code.`;

          const response3 = await callGeminiWithRetry(apiKey, { contents: refinePrompt }, { model });
          latexCode = sanitizeLatexCode(stripCodeFences(response3.text));
        }
      } catch (reviewError) {
        console.warn('Multi-pass review failed, using single-pass result:', reviewError.message);
      }
    } else {
      const response = await callGeminiWithRetry(apiKey, { contents: prompt }, { model });
      latexCode = sanitizeLatexCode(stripCodeFences(response.text));
    }

    return latexCode;
  } catch (error) {
    console.error('Error generating base LaTeX:', error);
    throw new Error('Failed to generate base LaTeX');
  }
};

exports.tailorLatex = async (baseLatex, jobDescription, userSkills = [], options = {}) => {
  const { useProModel = false } = options;
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

    const LATEX_INSTRUCTIONS = getTemplateInstructions();
    const model = useProModel ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

    const skillsContext = userSkills.length > 0
      ? `\nCANDIDATE'S KNOWN SKILLS (for reference — emphasize matches, weave in gaps subtly):\n${userSkills.join(', ')}\n`
      : '';

    const prompt = `${LATEX_INSTRUCTIONS}

You are an expert career coach, technical recruiter, and LaTeX developer. Your task is to tailor the candidate's existing LaTeX resume to maximize their chances of passing ATS screening and getting an interview for the target role.

${FEW_SHOT_EXAMPLES}

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
   - Follow the EXAMPLE STRONG BULLET POINTS style.

2. SKILLS SECTION — Reorder to put the most JD-relevant skills first. Group logically (Languages, Frameworks, Tools, etc.).

3. SECTION ORDERING — If the JD emphasizes experience over education, put Experience first. If it's an entry-level/academic role, Education first.

4. ATS OPTIMIZATION — Maximize keyword density for the specific JD without keyword-stuffing. Use the exact phrasing from the JD when it naturally fits.

5. SUMMARY/OBJECTIVE — If one exists, rewrite it to directly address this specific role. If none exists, do NOT add one.

6. INTEGRITY — Do NOT invent fake jobs, degrees, companies, or skills. You may only rephrase and re-emphasize existing real experience.

7. FORMATTING — Preserve the exact LaTeX formatting rules from the template specification above. Do NOT define custom macros. Ensure the output compiles cleanly with pdflatex.

8. Return ONLY the complete, valid tailored LaTeX code. Start with \\documentclass and end with \\end{document}. No markdown blocks.`;

    const response = await callGeminiWithRetry(apiKey, { contents: prompt }, { model });
    return sanitizeLatexCode(stripCodeFences(response.text));
  } catch (error) {
    console.error('Error tailoring LaTeX:', error);
    throw new Error('Failed to tailor LaTeX resume');
  }
};

exports.generateBaseLatexWithAchievements = async (resumeText, structuredProfile = null, options = {}) => {
  const { useMultiPass = true, useProModel = false } = options;
  const extractionService = require('./extractionService');

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

    let achievementContext = '';
    if (structuredProfile?.experience?.length > 0) {
      try {
        const extracted = await extractionService.extractAchievements(apiKey, structuredProfile.experience);
        if (extracted.achievements?.length > 0) {
          achievementContext = `
ACHIEVEMENT-ENHANCED EXPERIENCE (use these enhanced versions when available):
${JSON.stringify(extracted.achievements, null, 2)}
`;
        }
      } catch (e) {
        console.warn('Achievement extraction failed, proceeding without:', e.message);
      }
    }

    const LATEX_INSTRUCTIONS = getTemplateInstructions();

    let dataSection = '';
    if (structuredProfile) {
      const profileJson = JSON.stringify({
        basics: structuredProfile.basics || {},
        skills: structuredProfile.skills || [],
        experience: structuredProfile.experience || [],
        education: structuredProfile.education || [],
        projects: structuredProfile.projects || [],
      }, null, 2);

      dataSection = `
STRUCTURED PROFILE DATA (JSON):
${profileJson}

RAW RESUME TEXT:
${resumeText.substring(0, 8000)}`;
    } else {
      dataSection = `USER RESUME TEXT:\n${resumeText.substring(0, 12000)}`;
    }

    const prompt = `${LATEX_INSTRUCTIONS}

${FEW_SHOT_EXAMPLES}

${achievementContext}

Your task is to generate a complete, compilable LaTeX resume.

${dataSection}

ADDITIONAL INSTRUCTIONS:
1. Parse and identify all sections from the data.
2. Use the achievement-enhanced experience text when available.
3. Every bullet point MUST include an action verb and quantifiable metric.
4. Follow the EXAMPLE STRONG BULLET POINTS style guide.
5. Omit empty sections entirely.
6. Return ONLY the valid, compilable LaTeX code starting with \\documentclass.`;

    const model = useProModel ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    const response = await callGeminiWithRetry(apiKey, { contents: prompt }, { model });
    return sanitizeLatexCode(stripCodeFences(response.text));
  } catch (error) {
    console.error('Error generating base LaTeX with achievements:', error);
    throw new Error('Failed to generate base LaTeX');
  }
};
