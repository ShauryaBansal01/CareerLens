const Roadmap = require('../models/Roadmap');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// @desc    Get dynamic roadmap based on role and missing skills
// @route   POST /api/roadmap/generate
// @access  Private
exports.generateRoadmap = async (req, res) => {
  try {
    const { roleName, missingSkills } = req.body;

    if (!missingSkills || missingSkills.length === 0) {
      return res.status(200).json({
        role: roleName,
        beginner: [], intermediate: [], advanced: []
      });
    }

    try {
      const prompt = `You are a Senior Tech Career Coach at a top FAANG company. A candidate is targeting the role of "${roleName}" and is missing these exact skills: ${missingSkills.join(', ')}.

      Create a detailed, industry-standard 3-stage learning roadmap (beginner, intermediate, advanced) laser-focused on teaching ONLY these missing skills using the most in-demand tools and frameworks used at real companies in ${new Date().getFullYear()}.

      Rules:
      - "beginner" stage: foundational concepts and setup (week 1-4)
      - "intermediate" stage: real frameworks, libraries, and project-level application (week 5-10)
      - "advanced" stage: production-grade patterns, system design, performance, CI/CD, cloud deployment, or industry certifications (week 11-16)
      - Every skill entry must be something a hiring manager or tech lead at a real company would value
      - Include industry tools like Docker, GitHub Actions, AWS, Vercel, Supabase, Prisma, Playwright, etc. where relevant
      - isMissing should be true for all missing skills, false only for foundational prerequisites you add

      Return EXACTLY a valid JSON object:
      {
        "beginner": [{"skill": "Skill Name", "isMissing": true, "timeEstimate": "1 week", "resource": "https://..."}],
        "intermediate": [{"skill": "Skill Name", "isMissing": true, "timeEstimate": "2 weeks", "resource": "https://..."}],
        "advanced": [{"skill": "Skill Name", "isMissing": true, "timeEstimate": "3 weeks", "resource": "https://..."}]
      }
      Do not include markdown blocks, just raw JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const parsedRoadmap = JSON.parse(response.text);
      res.status(200).json({ role: roleName, ...parsedRoadmap });
    } catch (aiError) {
      console.error("Gemini Roadmap Error:", aiError);
      res.status(500).json({ message: 'Failed to generate AI roadmap.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed Roadmap data
// @route   POST /api/roadmap/seed
// @access  Public
exports.seedRoadmaps = async (req, res) => {
  try {
    await Roadmap.deleteMany();
    const roadmaps = await Roadmap.insertMany([
      {
        roleName: 'Frontend Developer',
        levels: {
          beginner: ['HTML', 'CSS', 'JavaScript'],
          intermediate: ['React', 'Tailwind', 'Git'],
          advanced: ['Next.js', 'TypeScript', 'Performance Optimization']
        }
      },
      {
        roleName: 'Backend Developer',
        levels: {
          beginner: ['JavaScript', 'Node.js', 'Express'],
          intermediate: ['MongoDB', 'SQL', 'REST APIs'],
          advanced: ['Docker', 'AWS', 'Microservices']
        }
      }
    ]);
    res.status(201).json(roadmaps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
