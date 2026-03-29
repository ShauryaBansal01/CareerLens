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
      const prompt = `You are a Senior Tech Career Coach. A candidate wants to become a "${roleName}" but is missing these exact skills: ${missingSkills.join(', ')}.
      Create a 3-stage learning roadmap (beginner, intermediate, advanced) specifically tailored to teach them ONLY these missing skills.
      Distribute the missing skills logically across the 3 stages based on difficulty. Add 1-2 fundamental prerequisites if absolutely necessary, but focus on the missing skills.
      Return EXACTLY a valid JSON object with the following schema:
      {
        "beginner": [{"skill": "Concept 1", "isMissing": true}],
        "intermediate": [{"skill": "Concept 2", "isMissing": true}],
        "advanced": [{"skill": "Concept 3", "isMissing": true}]
      }
      Do not include markdown blocks, just the raw JSON.`;

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
