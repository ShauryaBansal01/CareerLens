const UserProfile = require('../models/UserProfile');
const { z } = require('zod');

const profileSchema = z.object({
  basics: z.object({
    name: z.string().max(200).optional(),
    email: z.string().email().optional(),
    phone: z.string().max(50).optional(),
    location: z.string().max(200).optional(),
    summary: z.string().max(5000).optional(),
    linkedin: z.string().max(500).optional(),
    github: z.string().max(500).optional(),
    portfolio: z.string().max(500).optional(),
  }).optional(),
  skills: z.array(z.string().max(100)).max(200).optional(),
  experience: z.array(z.object({
    company: z.string().max(200).optional(),
    role: z.string().max(200).optional(),
    duration: z.string().max(100).optional(),
    description: z.union([z.string().max(10000), z.array(z.string().max(2000)).max(50)]).optional(),
  })).max(50).optional(),
  education: z.array(z.object({
    institution: z.string().max(200).optional(),
    degree: z.string().max(200).optional(),
    duration: z.string().max(100).optional(),
  })).max(20).optional(),
  projects: z.array(z.object({
    name: z.string().max(200).optional(),
    techStack: z.array(z.string().max(100)).max(50).optional(),
    description: z.string().max(5000).optional(),
  })).max(50).optional(),
  customLinks: z.array(z.object({
    label: z.string().max(100).optional(),
    url: z.string().max(1000).optional(),
  })).max(20).optional(),
});

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
    const parsed = profileSchema.parse(req.body);
    const { basics, skills, experience, education, projects, customLinks } = parsed;

    const profile = await UserProfile.findOne({ user: req.user.id });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (basics) profile.basics = { ...profile.basics, ...basics };
    if (skills) profile.skills = skills;
    if (experience) profile.experience = experience;
    if (education) profile.education = education;
    if (projects) profile.projects = projects;
    if (customLinks) profile.customLinks = customLinks;

    await profile.save();

    res.status(200).json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.issues.map(e => e.message);
      return res.status(400).json({ message: messages.join('; ') });
    }
    console.error('updateProfile Error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};
