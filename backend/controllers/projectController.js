const Project = require('../models/Project');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// @desc    Recommend projects based on missing skills
// @route   POST /api/projects/recommend
// @access  Private
exports.recommendProjects = async (req, res) => {
  try {
    const { missingSkills } = req.body;

    if (!missingSkills || missingSkills.length === 0) {
      return res.status(200).json([]);
    }

    try {
      const prompt = `You are an expert Coding Bootcamp Instructor. A candidate needs to learn the following specific skills: ${missingSkills.join(', ')}.
      Design 3 unique, realistic, and highly practical project blueprints they can build to master these exact skills.
      Each project MUST heavily utilize at least one or more of the missing skills.
      Return EXACTLY a valid JSON array of objects with the following schema:
      [
        {
          "title": "Project Title",
          "requiredSkills": ["Missing Skill 1", "Missing Skill 2", "Other Foundational Skill"],
          "description": "2-3 sentences explaining what this project is and why it's the perfect way to learn these skills."
        }
      ]
      Do not include markdown blocks, just the raw JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const parsedProjects = JSON.parse(response.text);
      res.status(200).json(parsedProjects);
    } catch (aiError) {
      console.error("Gemini Project Error:", aiError);
      res.status(500).json({ message: 'Failed to generate AI projects.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed Projects
// @route   POST /api/projects/seed
// @access  Public
exports.seedProjects = async (req, res) => {
  try {
    await Project.deleteMany();
    const projects = await Project.insertMany([
      {
        title: 'React Weather App',
        requiredSkills: ['react', 'javascript', 'css', 'api'],
        description: 'Build a weather dashboard using React and a public REST API.'
      },
      {
        title: 'JWT Auth backend',
        requiredSkills: ['node.js', 'express', 'mongodb', 'jwt'],
        description: 'Build a secure authentication API using Express and MongoDB.'
      },
      {
        title: 'Fullstack Task Manager',
        requiredSkills: ['react', 'node.js', 'express', 'mongodb', 'tailwind'],
        description: 'Create a scalable task platform with full CRUD features.'
      }
    ]);
    res.status(201).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
