const Resume = require('../models/Resume');
const pdfParse = require('pdf-parse');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const callGeminiWithRetry = async (params, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await ai.models.generateContent(params);
    } catch (error) {
      if ((error.status === 503 || error.status === 429) && i < maxRetries - 1) {
        console.warn(`Gemini API Error ${error.status}. Retrying in ${2 ** i} seconds...`);
        await sleep((2 ** i) * 1000);
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
CRITICAL INSTRUCTION: The user has requested AI Enhancement. 
Your task is to act as an elite Technical Recruiter. Take the rough notes provided in the 'experience' and 'projects' sections and heavily rewrite them into powerful, action-oriented bullet points using the STAR method. Use strong action verbs, emphasize technical skills, and make the descriptions sound highly professional and impactful. Make sure it sounds like a top-tier software engineer's resume. Do not invent entirely fake companies, but elevate the language and formatting significantly.`;
      } else {
        enhancePrompt = `
Format the provided data exactly as given into the LaTeX template without altering the core descriptions or words.`;
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

    const prompt = `You are an expert LaTeX developer and Resume Writer. Generate a professional, clean ATS-friendly resume in full LaTeX code.

CRITICAL REQUIREMENTS FOR LATEX:
- You must use the "article" class.
- You MUST INCLUDE these required packages at the very beginning of the document: \\usepackage{geometry}, \\usepackage{hyperref}, \\usepackage{enumitem}, \\usepackage{titlesec}, \\usepackage{xcolor}, \\usepackage{ragged2e}, \\usepackage{amsmath}, \\usepackage{fontawesome5}.
- Do NOT use custom classes or files that are not standard in TeX Live. 
- Ensure proper escaping of special characters like &, %, $, #, _, {, }, ~, ^, \\.
- Make sure lists (itemize) are properly opened and closed.

${enhancePrompt}

Inject the following user data into the LaTeX code appropriately:
${resumeContext}

Ensure it compiles directly with pdflatex without any errors. Only return the raw LaTeX code, without any markdown formatting or explanations. Start with \\documentclass.`;

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


