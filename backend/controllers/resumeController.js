const Resume = require('../models/Resume');
const pdfParse = require('pdf-parse');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const callGeminiWithRetry = async (params, maxRetries = 4) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await ai.models.generateContent(params);
    } catch (error) {
      if ((error.status === 503 || error.status === 429) && i < maxRetries - 1) {
        // Default backoff: 5s, 15s, 30s
        let delayMs = [5000, 15000, 30000][i] || 30000;
        
        // Try to extract exact requested wait time from Google's error message
        const match = String(error).match(/retry in ([\d\.]+)s/);
        if (match && match[1]) {
          delayMs = Math.ceil(parseFloat(match[1]) * 1000) + 2000; // Add 2s buffer
        }

        console.warn(`Gemini API Error 429/503. Retrying in ${Math.round(delayMs / 1000)} seconds...`);
        await sleep(delayMs);
      } else {
        throw error;
      }
    }
  }
};

// @desc    Upload & Parse Resume
// @route   POST /api/resume/upload
// @access  Private
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const data = await pdfParse(req.file.buffer);
    const rawText = data.text;

    let extractedSkills = [];
    let education = 'Not explicitly found';
    let experience = 'Not explicitly found';

    try {
      const response = await callGeminiWithRetry({
        model: 'gemini-2.5-flash',
        contents: `You are an expert technical recruiter AI. Extract the candidate's core technical skills, education summary, and experience summary from the following resume. 
        Return EXACTLY a valid JSON object with the following schema:
        {
          "skills": ["skill1", "skill2"],
          "education": "2-3 sentences summarizing their highest degrees",
          "experience": "2-3 sentences summarizing their work experience"
        }
        Do not include markdown blocks, just the raw JSON.
        
        Resume Text:
        ${rawText.substring(0, 15000)}`,
        config: { responseMimeType: "application/json" }
      });

      const parsedData = JSON.parse(response.text);
      extractedSkills = parsedData.skills ? parsedData.skills.map(s => s.toLowerCase()) : [];
      education = parsedData.education || education;
      experience = parsedData.experience || experience;
    } catch (aiError) {
      console.error("Gemini Extraction Error:", aiError);
      education = 'Analysis deferred (AI Key missing or error)';
      experience = 'Analysis deferred (AI Key missing or error)';
    }

    let resume = await Resume.findOne({ user: req.user.id });
    if (resume) {
      resume.extractedSkills = extractedSkills;
      resume.education = education;
      resume.experience = experience;
      resume.rawText = rawText;
      resume = await resume.save();
    } else {
      resume = await Resume.create({
        user: req.user.id,
        extractedSkills,
        education,
        experience,
        rawText
      });
    }

    res.status(200).json(resume);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error processing resume' });
  }
};

// @desc    Get user resume data
// @route   GET /api/resume/
// @access  Private
exports.getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user.id });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    res.status(200).json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    AI-powered general resume improvement suggestions
// @route   POST /api/resume/improve
// @access  Private
exports.improveResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: 'No resume found. Please upload your resume first.' });
    }

    const resumeContext = `
Skills: ${resume.extractedSkills.join(', ')}
Education: ${resume.education}
Experience: ${resume.experience}
Raw Text (first 8000 chars): ${(resume.rawText || '').substring(0, 8000)}
    `.trim();

    const prompt = `You are a Senior Technical Recruiter and Resume Coach at a top-tier tech company (Google, Meta, Amazon level). 
Analyze the following resume and provide detailed, actionable improvement suggestions.

Resume Content:
${resumeContext}

Analyze for ALL of the following and provide specific, actionable feedback:
1. Missing sections (Projects, Certifications, Summary, Links, etc.)
2. Weak bullet points (lack of metrics, vague language, no action verbs)
3. Skill gaps (missing in-demand skills for their apparent career level)
4. Formatting/structure issues (long paragraphs, poor organization)
5. ATS optimization (keyword density, formatting for Applicant Tracking Systems)
6. Impact statements (missing quantifiable achievements)

Return EXACTLY this valid JSON structure (no markdown):
{
  "score": 72,
  "summary": "One sentence overall assessment of the resume quality",
  "critical": [
    {
      "issue": "Short issue title",
      "detail": "Specific, actionable explanation with examples from their resume",
      "example": "Example of improved text or what to add"
    }
  ],
  "suggested": [
    {
      "issue": "Short issue title", 
      "detail": "Specific improvement suggestion",
      "example": "Concrete example"
    }
  ],
  "good": [
    {
      "issue": "What they're doing well",
      "detail": "Why this is effective"
    }
  ]
}

critical = must fix before applying (3-5 items)
suggested = would significantly improve the resume (3-5 items)
good = things already done well (2-3 items)`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const feedback = JSON.parse(response.text);
    res.status(200).json(feedback);
  } catch (error) {
    console.error('Resume Improve Error:', error);
    res.status(500).json({ message: 'Failed to generate resume improvement suggestions.' });
  }
};

// @desc    AI-powered company-specific resume optimization
// @route   POST /api/resume/optimize
// @access  Private
exports.optimizeForCompany = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription || jobDescription.trim().length < 20) {
      return res.status(400).json({ message: 'Please provide a job description or company requirements (minimum 20 characters).' });
    }

    const resume = await Resume.findOne({ user: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: 'No resume found. Please upload your resume first.' });
    }

    const resumeContext = `
Skills: ${resume.extractedSkills.join(', ')}
Education: ${resume.education}
Experience: ${resume.experience}
Resume Text (first 6000 chars): ${(resume.rawText || '').substring(0, 6000)}
    `.trim();

    const prompt = `You are a world-class Technical Resume Optimizer and Career Coach. Your job is to help a candidate tailor their resume to match a specific job description or company requirements.

CANDIDATE'S CURRENT RESUME:
${resumeContext}

TARGET JOB DESCRIPTION / COMPANY REQUIREMENTS:
${jobDescription.substring(0, 3000)}

Perform a deep gap analysis between the resume and the job description. Provide specific, actionable recommendations.

Return EXACTLY this valid JSON (no markdown):
{
  "matchScore": 68,
  "companySummary": "2 sentence summary of what the company/role is looking for",
  "add": [
    {
      "item": "Short title of what to add",
      "reason": "Why this matters for this specific role",
      "howTo": "Exactly how to add it — specific text or approach"
    }
  ],
  "remove": [
    {
      "item": "What to remove or de-emphasize",
      "reason": "Why it hurts rather than helps for this role"
    }
  ],
  "modify": [
    {
      "item": "What to change",
      "before": "Current weak version (quote from resume or describe)",
      "after": "Improved version tailored to this job"
    }
  ],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

add = 3-5 things to add that the job requires but resume lacks
remove = 2-3 things that are irrelevant or harmful for this specific role  
modify = 3-4 specific bullet points or sections to rewrite for better fit
keywords = top 5-8 ATS keywords from the job description missing in the resume`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const optimization = JSON.parse(response.text);
    res.status(200).json(optimization);
  } catch (error) {
    console.error('Resume Optimize Error:', error);
    res.status(500).json({ message: 'Failed to generate optimization suggestions.' });
  }
};

// @desc    Get saved LaTeX code
// @route   GET /api/resume/latex
// @access  Private
exports.getLatexCode = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: 'No resume found.' });
    }
    res.status(200).json({ rawLatexCode: resume.rawLatexCode || '' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save LaTeX code
// @route   POST /api/resume/latex
// @access  Private
exports.saveLatexCode = async (req, res) => {
  try {
    const { rawLatexCode } = req.body;
    let resume = await Resume.findOne({ user: req.user.id });
    
    if (resume) {
      resume.rawLatexCode = rawLatexCode;
      await resume.save();
    } else {
      // Create barebone if doesn't exist but has ID
      resume = await Resume.create({
        user: req.user.id,
        rawLatexCode,
        extractedSkills: [],
        education: "",
        experience: "",
        rawText: ""
      });
    }
    
    res.status(200).json({ message: 'LaTeX code saved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate a tailored LaTeX template from parsed data
// @route   POST /api/resume/latex/generate
// @access  Private
exports.generateLatexTemplate = async (req, res) => {
  try {
    const { resumeData } = req.body;
    let resumeContext = "";
    let enhancePrompt = "";

    if (resumeData) {
      resumeContext = JSON.stringify(resumeData, null, 2);
      if (resumeData.enhanceWithAI) {
        enhancePrompt = `
CRITICAL INSTRUCTION FOR CONTENT: The user has requested AI Enhancement. 
Your task is to act as an elite Technical Recruiter. Take the rough notes provided in the 'experience' and 'projects' sections and heavily rewrite them into powerful, action-oriented bullet points using the STAR method (Situation, Task, Action, Result). 
- Use strong action verbs.
- Include quantifiable metrics where possible.
- Emphasize technical skills and modern frameworks.
- Generate strictly 3-4 bullet points per job/project. Do NOT write paragraphs.
- Keep bullet points concise and to the point.`;
      } else {
        enhancePrompt = `
CRITICAL INSTRUCTION FOR CONTENT: Format the provided data exactly as given into the LaTeX template without altering the core descriptions or words.`;
      }
    } else {
      const resume = await Resume.findOne({ user: req.user.id });
      if (!resume) {
        return res.status(404).json({ message: 'No resume found.' });
      }
      resumeContext = `
Skills: ${resume.extractedSkills.join(', ')}
Education: ${resume.education}
Experience: ${resume.experience}
      `.trim();
      enhancePrompt = "Format this extracted data into a clean ATS-friendly LaTeX resume.";
    }

    const prompt = `You are an expert LaTeX developer and a Senior Technical Recruiter. Your task is to generate a beautiful, modern, ATS-friendly software engineering resume in strict LaTeX code based on the provided JSON data.

CRITICAL LATEX & DESIGN REQUIREMENTS:
- Use the standard "article" class with 11pt font.
- You MUST INCLUDE these required packages: \\usepackage[letterpaper, margin=0.5in]{geometry}, \\usepackage{hyperref}, \\usepackage{enumitem}, \\usepackage{titlesec}, \\usepackage{xcolor}, \\usepackage{tgtermes}, \\usepackage[T1]{fontenc}.
- The font must be a highly professional serif font (TeX Gyre Termes, which resembles Times New Roman) for a classic, executive look.
- Disable page numbers by including \\pagestyle{empty}.
- Configure the list formatting globally for a clean, tight look: \\setlist[itemize]{leftmargin=0.15in, label={--}, itemsep=2pt, parsep=0pt, topsep=2pt, partopsep=0pt}
- Format section headers to be classic and distinct. Example: \\titleformat{\\section}{\\large\\bfseries\\scshape}{}{0em}{}[\\vspace{-0.5em}\\rule{\\textwidth}{0.5pt}]
- Ensure proper escaping of LaTeX special characters like &, %, $, #, _, {, }, ~, ^, \\ manually in the text. Do NOT define or use any custom macros like \\safeText for escaping. Escape them directly (e.g. \\%).
- For the Header: The Name should be large, centered, and bold (e.g. \\begin{center}\\Huge\\textbf{Name}\\vspace{2pt}\\end{center}). Below it, output the contact info centered on a single line, separated by pipes (|) and hyperlinking the URLs.
- For Sections (Education, Experience, Projects): Use a strict 4-corner layout for headers. Do NOT use \\item for headers. Just use regular text and line breaks (\\\\).
  Example format for a job or project:
  \\noindent\\textbf{Company Name} \\hfill Location\\\\
  \\textit{Job Title} \\hfill \\textit{Jan 2020 -- Present}
  \\begin{itemize}
    \\item First bullet point...
  \\end{itemize}
- Use bullet points (\\begin{itemize} \\item ... \\end{itemize}) ONLY for the descriptions/accomplishments under each job or project.

CONDITIONAL LOGIC (EXTREMELY IMPORTANT):
- You are receiving the user's data as JSON.
- IF a field, array, or section (such as 'projects', 'experience', 'education', 'skills', or any contact link) is EMPTY, blank, contains only whitespace, or is missing in the JSON, you MUST completely omit that section or field from the LaTeX document. 
- Do NOT output empty headers (e.g. no "Projects" section if the projects array is empty).
- Do NOT output placeholder text (e.g. "School Name" or "Company Name") if the user provided blank strings. Just skip that entry.
- DO NOT define or use any custom commands or macros like \\safeText. Write pure, standard LaTeX.

${enhancePrompt}

USER DATA (JSON):
${resumeContext}

Ensure it compiles directly with pdflatex without any errors. Only return the raw LaTeX code, without any markdown formatting blocks (do not wrap in \`\`\`latex ... \`\`\`). Start the output immediately with \\documentclass.`;

    const response = await callGeminiWithRetry({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    let latexCode = response.text.replace(/^```(latex)?/im, '').replace(/```$/im, '').trim();

    let resume = await Resume.findOne({ user: req.user.id });
    if (resume) {
      resume.rawLatexCode = latexCode;
      await resume.save();
    }

    res.status(200).json({ rawLatexCode: latexCode });
  } catch (error) {
    console.error('LaTeX Generation Error:', error);
    res.status(500).json({ message: 'Failed to generate LaTeX template.' });
  }
};

// @desc    Tailor a resume specifically to a given Job Description and generate LaTeX
// @route   POST /api/resume/latex/tailor
// @access  Private
exports.tailorLatexToJob = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    
    if (!jobDescription || jobDescription.trim().length < 20) {
      return res.status(400).json({ message: 'Please provide a valid job description (minimum 20 characters).' });
    }

    const resume = await Resume.findOne({ user: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: 'No resume found. Please upload your resume first.' });
    }

    const resumeContext = `
Skills: ${resume.extractedSkills.join(', ')}
Education: ${resume.education}
Experience: ${resume.experience}
Raw Text (first 8000 chars): ${(resume.rawText || '').substring(0, 8000)}
    `.trim();

    const prompt = `You are an expert LaTeX developer and an elite Technical Recruiter at a top tech company. 
Your task is to generate a beautiful, modern, ATS-friendly software engineering resume in strict LaTeX code based on the candidate's existing resume AND a Target Job Description.

CRITICAL INSTRUCTION FOR CONTENT (TAILORING):
- You MUST aggressively tailor the candidate's existing experience and skills to match the Job Description.
- Identify the core skills, keywords, and responsibilities mentioned in the JD.
- Keep ONLY the candidate's experience, projects, and skills that are highly relevant to this specific JD. Completely remove or drastically minimize irrelevant "fluff" or unrelated jobs.
- Rewrite the bullet points using the STAR method (Situation, Task, Action, Result) to subtly incorporate keywords from the JD without lying. Emphasize their achievements that align best with the target role.
- Maximize keyword density for ATS optimization based on the JD.

CRITICAL LATEX & DESIGN REQUIREMENTS:
- Use the standard "article" class with 11pt font.
- You MUST INCLUDE these required packages: \\usepackage[letterpaper, margin=0.5in]{geometry}, \\usepackage{hyperref}, \\usepackage{enumitem}, \\usepackage{titlesec}, \\usepackage{xcolor}, \\usepackage{tgtermes}, \\usepackage[T1]{fontenc}.
- The font must be a highly professional serif font (TeX Gyre Termes).
- Disable page numbers with \\pagestyle{empty}.
- Configure list formatting globally: \\setlist[itemize]{leftmargin=0.15in, label={--}, itemsep=2pt, parsep=0pt, topsep=2pt, partopsep=0pt}
- Format section headers to be classic and distinct. Example: \\titleformat{\\section}{\\large\\bfseries\\scshape}{}{0em}{}[\\vspace{-0.5em}\\rule{\\textwidth}{0.5pt}]
- Escape LaTeX special characters (e.g. &, %, $, #, _) directly in the text. Do NOT use custom macros.
- Header: Name large, centered, bold. Contact info centered below it on a single line, separated by pipes (|).
- Sections (Education, Experience, Projects): Use a strict 4-corner layout for headers. Use regular text and line breaks (\\\\), NOT \\item for headers.
- Use bullet points (\\begin{itemize} \\item ... \\end{itemize}) ONLY for the descriptions/accomplishments.
- Start output immediately with \\documentclass. Do NOT output any markdown blocks (e.g., \`\`\`latex ... \`\`\`).

CANDIDATE'S EXISTING RESUME:
${resumeContext}

TARGET JOB DESCRIPTION:
${jobDescription.substring(0, 4000)}

Only return the raw, compiling LaTeX code.`;

    const response = await callGeminiWithRetry({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    let latexCode = response.text.replace(/^```(latex)?/im, '').replace(/```$/im, '').trim();

    resume.rawLatexCode = latexCode;
    await resume.save();

    res.status(200).json({ rawLatexCode: latexCode });
  } catch (error) {
    console.error('Tailor LaTeX Error:', error);
    res.status(500).json({ message: 'Failed to generate tailored LaTeX resume.' });
  }
};


