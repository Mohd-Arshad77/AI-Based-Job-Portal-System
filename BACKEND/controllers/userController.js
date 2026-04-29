import fs from "fs/promises";
import path from "path";
import User from "../models/User.js";
import Run from "../models/Run.js";
import Job from "../models/Job.js";
import Notification from "../models/Notification.js";
import { io, getReceiverSocketId } from "../socket.js";
import asyncHandler from "../utils/asyncHandler.js";

const sanitizeUser = (user) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    location: user.location,
    role: user.role,
    skills: user.skills,
    experience: user.experience,
    education: user.education,
    resume: user.resume || user.resumeUrl || "",
    resumeUrl: user.resumeUrl,
    resumeUpdatedAt: user.resumeUpdatedAt,
    parsedData: user.parsedData,
    createdAt: user.createdAt
  };
};

const normalizeSkills = (skills = []) => {
  return Array.isArray(skills)
    ? [...new Map(
      skills
        .map((skill) => String(skill).trim())
        .filter(Boolean)
        .map((skill) => [skill.toLowerCase(), skill])
    ).values()]
    : [];
};

const saveResumeFile = async (file, userId) => {
  const uploadsDir = path.join(process.cwd(), "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const extension = path.extname(file.originalname || "") || ".pdf";
  const fileName = `${Date.now()}-${userId}${extension}`;
  const filePath = path.join(uploadsDir, fileName);

  await fs.writeFile(filePath, file.buffer);

  return `/uploads/${fileName}`;
};

export const getProfile = asyncHandler(async (req, res) => {
  const targetUserId = req.query.userId || req.user._id;

  const user = await User.findById(targetUserId)
    .select("-password")
    .lean();

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (req.query.userId && req.user.role === "recruiter" && req.query.userId !== req.user._id.toString()) {
    const notifyUser = await Notification.create({
      userId: targetUserId,
      type: "profile_view",
      message: `A recruiter just viewed your profile!`
    });
    const userSocket = getReceiverSocketId(targetUserId.toString());
    if (userSocket) {
      io.to(userSocket).emit("profile_viewed", notifyUser);
      io.to(userSocket).emit("new_notification", notifyUser);
    }
  }

  res.json(sanitizeUser(user));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  const { name, phone, location, experience, education, skills } = req.body;
  const updates = {};

  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (location !== undefined) updates.location = location;
  if (experience !== undefined) {
    const parsedExperience = experience === "" ? 0 : Number(experience);

    if (Number.isNaN(parsedExperience)) {
      res.status(400);
      throw new Error("Experience must be a number.");
    }

    updates.experience = parsedExperience;
  }
  if (education !== undefined) updates.education = education;
  if (skills !== undefined) updates.skills = normalizeSkills(skills);

  const updatedUser = Object.keys(updates).length > 0
    ? await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    })
    : user;

  res.json({
    message: "Profile updated successfully",
    user: sanitizeUser(updatedUser)
  });
});

export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Resume file is required.");
  }

  if (req.file.mimetype !== "application/pdf") {
    res.status(400);
    throw new Error("Only PDF files are allowed.");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  const resumeUrl = await saveResumeFile(req.file, req.user._id);
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      resume: resumeUrl,
      resumeUrl: resumeUrl,
      resumeUpdatedAt: new Date()
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.json({
    message: "Resume updated successfully",
    resume: updatedUser.resume || updatedUser.resumeUrl,
    resumeUrl: updatedUser.resumeUrl,
    user: sanitizeUser(updatedUser)
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
