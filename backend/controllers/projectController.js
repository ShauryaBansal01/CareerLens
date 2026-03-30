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
      const prompt = `You are a Principal Engineer at a top tech company and an expert coding bootcamp instructor. A candidate needs to master these specific skills: ${missingSkills.join(', ')}.

      Design 3 unique, production-grade project blueprints they can build and put on their GitHub/portfolio to impress real hiring managers in ${new Date().getFullYear()}.

      Rules:
      - Each project must heavily use the missing skills listed above
      - Projects must be realistic and deployable (not "todo apps") — think real-world use cases
      - Stack must reflect what companies actually use (e.g. Next.js, Docker, PostgreSQL, AWS, Prisma, Stripe, etc.)
      - Include a "deployTarget" like "Vercel", "AWS EC2", "Railway", "Fly.io", etc.
      - Include a "difficulty" field: "Beginner", "Intermediate", or "Advanced"
      - description should explain what the project does, which missing skill it primarily targets, and why it impresses hiring managers

      Return EXACTLY a valid JSON array:
      [
        {
          "title": "Project Title",
          "difficulty": "Intermediate",
          "deployTarget": "Vercel",
          "requiredSkills": ["Missing Skill 1", "Missing Skill 2", "Supporting Tool"],
          "description": "2-3 sentences: what it is, what skill gap it closes, and what makes it impressive to recruiters."
        }
      ]
      Do not include markdown blocks, just raw JSON.`;

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
