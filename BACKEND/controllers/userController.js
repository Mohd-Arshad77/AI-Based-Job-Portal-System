import path from "path";
import User from "../models/User.js";
import Run from "../models/Run.js";
import Job from "../models/Job.js";
import asyncHandler from "../utils/asyncHandler.js";

const sanitizeUser = (user) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    skills: user.skills,
    experience: user.experience,
    education: user.education,
    resumeUrl: user.resumeUrl,
    parsedData: user.parsedData,
    createdAt: user.createdAt
  };
};

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password")
    .lean();

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(sanitizeUser(user));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  if (req.body.name) user.name = req.body.name;
  if (Array.isArray(req.body.skills)) user.skills = req.body.skills;
  if (req.body.experience) user.experience = req.body.experience;
  if (req.body.education) user.education = req.body.education;

  await user.save();

  res.json({ 
    message: "Profile updated successfully", 
    user: sanitizeUser(user) 
  });
});

export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Resume file is required.");
  }

  let extension = ".pdf";
  if (req.file.originalname) {
    extension = path.extname(req.file.originalname) || ".pdf";
  }
  
  const resumeUrl = `/uploads/${Date.now()}-${req.user._id}${extension}`;

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  user.resumeUrl = resumeUrl;
  await user.save();

  res.json({ 
    message: "Resume uploaded successfully", 
    resumeUrl: user.resumeUrl 
  });
});

export const getRecommendedJobs = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("skills parsedData experience")
    .lean();

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  const userSkills = user.skills?.length > 0
    ? user.skills
    : user.parsedData?.skills || [];

  if (userSkills.length === 0) {
    return res.json([]);
  }

  const recommendations = await Job.aggregate([
    {
      $match: {
        isActive: true,
        isApproved: true,
        skillsRequired: { $exists: true, $ne: [] }
      }
    },
    {
      $addFields: {
        matchedSkills: {
          $setIntersection: ["$skillsRequired", userSkills]
        }
      }
    },
    {
      $addFields: {
        matchScore: {
          $cond: [
            { $gt: [{ $size: "$skillsRequired" }, 0] },
            {
              $divide: [
                { $size: "$matchedSkills" },
                { $size: "$skillsRequired" }
              ]
            },
            0
          ]
        }
      }
    },
    {
      $match: { matchScore: { $gt: 0 } }
    },
    {
      $sort: { matchScore: -1 }
    },
    {
      $limit: 10
    },
    {
      $project: {
        _id: 1,
        jobId: "$_id",
        title: 1,
        company: 1,
        matchedSkills: 1,
        matchScore: 1,
        score: "$matchScore"
      }
    }
  ]);

  const resumeText =
    user.parsedData?.summary ||
    user.experience ||
    "Profile-based recommendation";

  await Run.create({
    userId: user._id,
    resumeText: resumeText,
    extractedSkills: userSkills,
    recommendedJobs: recommendations
  });

  res.json(recommendations);
});