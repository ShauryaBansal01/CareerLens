const Project = require('../models/Project');

// @desc    Recommend projects based on missing skills
// @route   POST /api/projects/recommend
// @access  Private
exports.recommendProjects = async (req, res) => {
  try {
    const { missingSkills } = req.body;

    if (!missingSkills || missingSkills.length === 0) {
      return res.status(200).json([]);
    }

    // Find projects where at least one required skill is in the user's missing skills
    // In a real scenario, we might sort by the number of missing skills matched.
    const allProjects = await Project.find({});

    const recommended = allProjects.filter(project => {
      // Check if project.requiredSkills has intersection with missingSkills
      const lowerReq = project.requiredSkills.map(s => s.toLowerCase());
      return lowerReq.some(skill => missingSkills.includes(skill));
    });

    res.status(200).json(recommended);
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
