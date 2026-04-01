import path from "path";
import User from "../models/User.js";
import Run from "../models/Run.js";
import Job from "../models/Job.js";
import asyncHandler from "../utils/asyncHandler.js";
import { calculateJobMatch } from "../utils/resumeParser.js";

const sanitizeUser = (user) => ({
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
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json(user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  const { name, skills, experience, education } = req.body;

  user.name = name ?? user.name;
  user.skills = Array.isArray(skills) ? skills : user.skills;
  user.experience = experience ?? user.experience;
  user.education = education ?? user.education;

  await user.save();

  res.json({ message: "Profile updated successfully", user: sanitizeUser(user) });
});

export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Resume file is required.");
  }

  const user = await User.findById(req.user._id);
  const extension = path.extname(req.file.originalname || ".pdf") || ".pdf";
  user.resumeUrl = `/uploads/${Date.now()}-${user._id}${extension}`;
  await user.save();

  res.json({ message: "Resume uploaded successfully", resumeUrl: user.resumeUrl });
});

export const getRecommendedJobs = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const jobs = await Job.find({ isActive: true, isApproved: true }).lean();

  const recommendations = jobs
    .map((job) => {
      const { matchedSkills, score } = calculateJobMatch(
        user.skills?.length ? user.skills : user.parsedData?.skills || [],
        job.skillsRequired || []
      );

      return { ...job, matchedSkills, matchScore: score };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  await Run.create({
    userId: user._id,
    resumeText: user.parsedData?.summary || user.experience || "Profile-based recommendation",
    extractedSkills: user.skills?.length ? user.skills : user.parsedData?.skills || [],
    recommendedJobs: recommendations.slice(0, 10).map((job) => ({
      jobId: job._id,
      matchedSkills: job.matchedSkills,
      score: job.matchScore
    }))
  });

  res.json(recommendations);
});
