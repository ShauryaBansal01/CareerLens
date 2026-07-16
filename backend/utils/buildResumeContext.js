const UserProfile = require('../models/UserProfile');
const Resume = require('../models/Resume');

/**
 * Build the richest possible resume context string from structured profile
 * data and raw resume text. Used by all AI-powered resume endpoints.
 *
 * @param {string} userId - The authenticated user's ID
 * @param {object} [options]
 * @param {number} [options.maxRawTextLength=6000] - Max chars of raw text to include
 * @param {boolean} [options.includeBasics=false] - Include contact/basics fields
 * @returns {Promise<string>} The formatted context string
 */
async function buildResumeContext(userId, options = {}) {
  const { maxRawTextLength = 6000, includeBasics = false } = options;

  const [profile, resume] = await Promise.all([
    UserProfile.findOne({ user: userId }),
    Resume.findOne({ user: userId }),
  ]);

  if (!resume) {
    return null;
  }

  if (profile) {
    const structuredData = {};

    if (includeBasics) {
      structuredData.basics = {
        name: profile.basics?.name || '',
        email: profile.basics?.email || '',
        phone: profile.basics?.phone || '',
        location: profile.basics?.location || '',
        summary: profile.basics?.summary || '',
        linkedin: profile.basics?.linkedin || '',
        github: profile.basics?.github || '',
        portfolio: profile.basics?.portfolio || '',
      };
    }

    structuredData.skills = profile.skills || resume.extractedSkills || [];

    structuredData.experience = (profile.experience || []).map((exp, i) => ({
      ...(includeBasics ? { _index: i } : {}),
      company: exp.company,
      role: exp.role,
      duration: exp.duration,
      description: exp.description,
    }));

    structuredData.education = (profile.education || []).map((edu, i) => ({
      ...(includeBasics ? { _index: i } : {}),
      institution: edu.institution,
      degree: edu.degree,
      duration: edu.duration,
    }));

    structuredData.projects = (profile.projects || []).map((proj, i) => ({
      ...(includeBasics ? { _index: i } : {}),
      name: proj.name,
      description: proj.description,
      techStack: proj.techStack || [],
    }));

    return `STRUCTURED RESUME DATA (parsed from upload — high accuracy):
${JSON.stringify(structuredData, null, 2)}

RAW RESUME TEXT (original PDF text — use for additional context the structured data may have missed):
${(resume.rawText || '').substring(0, maxRawTextLength)}`;
  }

  // Fallback: no profile, use what we have
  return `Skills: ${resume.extractedSkills.join(', ')}
Education: ${resume.education}
Experience: ${resume.experience}
Raw Resume Text:
${(resume.rawText || '').substring(0, maxRawTextLength)}`;
}

module.exports = { buildResumeContext };
