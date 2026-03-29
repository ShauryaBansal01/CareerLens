/**
 * Compares user skills to required skills for a role.
 * @param {Array<String>} userSkills 
 * @param {Array<String>} requiredSkills 
 * @returns {Object} Gap analysis result
 */
exports.calculateSkillGap = (userSkills, requiredSkills) => {
  const normalizedUserSkills = userSkills.map(s => s.toLowerCase());
  const normalizedRequiredSkills = requiredSkills.map(s => s.toLowerCase());

  const matchedSkills = normalizedRequiredSkills.filter(skill => normalizedUserSkills.includes(skill));
  const missingSkills = normalizedRequiredSkills.filter(skill => !normalizedUserSkills.includes(skill));

  const totalRequired = normalizedRequiredSkills.length;
  // Job Readiness Score calculation from Step 3 (just the skills match portion for now: max 50%)
  // The full score includes projects (20%), exp (20%), consistency (10%), which can be mocked or calculated later.
  // For the basic Score metric string requirement: Score = (Matched Skills / Total Required Skills) * 100
  
  let matchPercentage = 0;
  if (totalRequired > 0) {
    matchPercentage = Math.round((matchedSkills.length / totalRequired) * 100);
  }

  // Calculate the 50% weighted job readiness base score from skills
  const skillsWeightedScore = parseFloat(((matchPercentage / 100) * 50).toFixed(2));

  return {
    matchedSkills,
    missingSkills,
    matchPercentage,
    skillsWeightedScore,
    totalRequired
  };
};
