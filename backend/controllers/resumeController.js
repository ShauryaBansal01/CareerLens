const Resume = require('../models/Resume');
const pdfParse = require('pdf-parse');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// @desc    Upload & Parse Resume
// @route   POST /api/resume/upload
// @access  Private
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Parse PDF buffer
    const data = await pdfParse(req.file.buffer);
    const rawText = data.text;

    // Use Gemini to extract structured data
    let extractedSkills = [];
    let education = 'Not explicitly found';
    let experience = 'Not explicitly found';

    try {
      const response = await ai.models.generateContent({
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
        config: {
          responseMimeType: "application/json",
        }
      });

      const resultText = response.text;
      const parsedData = JSON.parse(resultText);
      extractedSkills = parsedData.skills ? parsedData.skills.map(s => s.toLowerCase()) : [];
      education = parsedData.education || education;
      experience = parsedData.experience || experience;
    } catch (aiError) {
      console.error("Gemini Extraction Error:", aiError);
      // Fallback if AI fails or key is invalid
      education = 'Analysis deferred (AI Key missing or error)';
      experience = 'Analysis deferred (AI Key missing or error)';
    }

    // Save or update to DB
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
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.status(200).json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
