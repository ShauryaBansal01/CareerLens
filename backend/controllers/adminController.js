const Role = require('../models/Role');
const Project = require('../models/Project');
const Roadmap = require('../models/Roadmap');

// @desc    Get all stats (Users, Roles, Projects)
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    const rolesCount = await Role.countDocuments();
    const projectsCount = await Project.countDocuments();
    const roadmapsCount = await Roadmap.countDocuments();
    
    // Send summary stats
    res.json({
      rolesCount,
      projectsCount,
      roadmapsCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new Role
// @route   POST /api/admin/role
// @access  Private/Admin
exports.addRole = async (req, res) => {
  try {
    const { roleName, requiredSkills } = req.body;
    const newRole = await Role.create({
      roleName,
      requiredSkills: requiredSkills.map(s => s.trim())
    });
    res.status(201).json(newRole);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a Role
// @route   DELETE /api/admin/role/:id
// @access  Private/Admin
exports.deleteRole = async (req, res) => {
  try {
    const roleId = req.params.id;
    await Role.findByIdAndDelete(roleId);
    res.status(200).json({ message: 'Role deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new Project
// @route   POST /api/admin/project
// @access  Private/Admin
exports.addProject = async (req, res) => {
  try {
    const { title, requiredSkills, description } = req.body;
    const newProject = await Project.create({
      title,
      description,
      requiredSkills: requiredSkills.map(s => s.trim())
    });
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a Project
// @route   DELETE /api/admin/project/:id
// @access  Private/Admin
exports.deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    await Project.findByIdAndDelete(projectId);
    res.status(200).json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
