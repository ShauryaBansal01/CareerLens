const UserProfile = require('../models/UserProfile');

// @desc    Get user profile (creates empty one if not exists)
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    let profile = await UserProfile.findOne({ user: req.user.id });
    
    if (!profile) {
      // Create a default empty profile
      profile = await UserProfile.create({
        user: req.user.id,
        basics: { name: req.user.name, email: req.user.email }
      });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('getProfile Error:', error);
    res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

// @desc    Update user profile 
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { basics, skills, experience, education, projects } = req.body;

    let profile = await UserProfile.findOne({ user: req.user.id });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Update fields
    if (basics) profile.basics = { ...profile.basics, ...basics };
    if (skills) profile.skills = skills;
    if (experience) profile.experience = experience;
    if (education) profile.education = education;
    if (projects) profile.projects = projects;

    await profile.save();

    res.status(200).json(profile);
  } catch (error) {
    console.error('updateProfile Error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};
