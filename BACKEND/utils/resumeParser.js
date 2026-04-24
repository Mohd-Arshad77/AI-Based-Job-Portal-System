import skillKeywords from "./resumeKeywords.js";

export const parseResumeText = (text) => {
  if (!text) {
    text = "";
  }

  const normalizedText = text.toLowerCase();
  
  let matchedSkills = [];

  for (let i = 0; i < skillKeywords.length; i++) {
    const skill = skillKeywords[i];
    const lowerSkill = skill.toLowerCase();

    if (normalizedText.indexOf(lowerSkill) !== -1) {
      let isDuplicate = false;
      for (let j = 0; j < matchedSkills.length; j++) {
        if (matchedSkills[j] === skill) {
          isDuplicate = true;
          break;
        }
      }

      if (isDuplicate === false) {
        matchedSkills[matchedSkills.length] = skill;
      }
    }
  }

  const rawLines = text.split("\n");
  let cleanLines = [];

  for (let i = 0; i < rawLines.length; i++) {
    const trimmedLine = rawLines[i].trim();
    if (trimmedLine.length > 0) {
      cleanLines[cleanLines.length] = trimmedLine;
    }
  }

  let projects = [];
  let experience = [];

  for (let i = 0; i < cleanLines.length; i++) {
    const lineLower = cleanLines[i].toLowerCase();

    if (projects.length < 5) {
      if (
        lineLower.indexOf("project") !== -1 ||
        lineLower.indexOf("portfolio") !== -1 ||
        lineLower.indexOf("application") !== -1 ||
        lineLower.indexOf("platform") !== -1
      ) {
        projects[projects.length] = cleanLines[i];
      }
    }

    if (experience.length < 5) {
      if (
        lineLower.indexOf("experience") !== -1 ||
        lineLower.indexOf("intern") !== -1 ||
        lineLower.indexOf("engineer") !== -1 ||
        lineLower.indexOf("developer") !== -1 ||
        lineLower.indexOf("analyst") !== -1 ||
        lineLower.indexOf("manager") !== -1
      ) {
        experience[experience.length] = cleanLines[i];
      }
    }
  }

  let summary = "";
  let limit = cleanLines.length < 4 ? cleanLines.length : 4;

  for (let i = 0; i < limit; i++) {
    summary += cleanLines[i];
    if (i < limit - 1) {
      summary += " ";
    }
  }

  return {
    skills: matchedSkills,
    projects: projects,
    experience: experience,
    summary: summary
  };
};

export const calculateJobMatch = (userSkills, jobSkills) => {
  if (!userSkills) userSkills = [];
  if (!jobSkills) jobSkills = [];

  let matchedSkills = [];

  for (let i = 0; i < jobSkills.length; i++) {
    let currentJobSkill = jobSkills[i].toLowerCase();
    let userHasSkill = false;

    for (let j = 0; j < userSkills.length; j++) {
      let currentUserSkill = userSkills[j].toLowerCase();

      if (currentUserSkill === currentJobSkill) {
        userHasSkill = true;
        break;
      }
    }

    if (userHasSkill === true) {
      matchedSkills[matchedSkills.length] = currentJobSkill;
    }
  }

  let score = 0;
  
  if (jobSkills.length > 0) {
    let rawDecimal = matchedSkills.length / jobSkills.length;
    score = Math.round(rawDecimal * 100);
  }

  return { 
    matchedSkills: matchedSkills, 
    score: score 
  };
};