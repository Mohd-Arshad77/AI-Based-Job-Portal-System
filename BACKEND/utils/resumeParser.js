import skillKeywords from "./resumeKeywords.js";

const uniqueMatches = (items) => [...new Set(items.map((item) => item.trim()))];

export const parseResumeText = (text = "") => {
  const normalized = text.toLowerCase();
  const matchedSkills = uniqueMatches(skillKeywords.filter((skill) => normalized.includes(skill.toLowerCase())));

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const projects = lines.filter((line) => /project|portfolio|application|platform/i.test(line)).slice(0, 5);
  const experience = lines.filter((line) => /experience|intern|engineer|developer|analyst|manager/i.test(line)).slice(0, 5);

  return {
    skills: matchedSkills,
    projects,
    experience,
    summary: lines.slice(0, 4).join(" ")
  };
};

export const calculateJobMatch = (userSkills = [], jobSkills = []) => {
  const normalizedUserSkills = userSkills.map((skill) => skill.toLowerCase());
  const normalizedJobSkills = jobSkills.map((skill) => skill.toLowerCase());
  const matchedSkills = normalizedJobSkills.filter((skill) => normalizedUserSkills.includes(skill));

  const score = normalizedJobSkills.length ? Math.round((matchedSkills.length / normalizedJobSkills.length) * 100) : 0;

  return { matchedSkills, score };
};
