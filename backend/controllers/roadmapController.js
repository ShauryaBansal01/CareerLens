const Roadmap = require('../models/Roadmap');

// @desc    Get dynamic roadmap based on role and missing skills
// @route   POST /api/roadmap/generate
// @access  Private
exports.generateRoadmap = async (req, res) => {
  try {
    const { roleName, missingSkills } = req.body;

    const roadmapTemplate = await Roadmap.findOne({ roleName });
    if (!roadmapTemplate) {
      return res.status(404).json({ message: 'Roadmap not found for this role.' });
    }

    // Filter roadmap levels to only show steps relevant to missing skills
    // We do a simple intersection, or just return the template if we want to show everything with highlights
    // For this engine, we will dynamically generate an ordered list highlighting missing skills 

    const dynamicRoadmap = {
      role: roleName,
      beginner: roadmapTemplate.levels.beginner.map(skill => ({
        skill,
        isMissing: missingSkills.includes(skill.toLowerCase())
      })),
      intermediate: roadmapTemplate.levels.intermediate.map(skill => ({
        skill,
        isMissing: missingSkills.includes(skill.toLowerCase())
      })),
      advanced: roadmapTemplate.levels.advanced.map(skill => ({
        skill,
        isMissing: missingSkills.includes(skill.toLowerCase())
      }))
    };

    res.status(200).json(dynamicRoadmap);
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
