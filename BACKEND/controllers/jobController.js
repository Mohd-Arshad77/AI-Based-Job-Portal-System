import Job from "../models/Job.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { io, getReceiverSocketId } from "../socket.js";
import asyncHandler from "../utils/asyncHandler.js";
import { calculateJobMatch } from "../utils/resumeParser.js";

export const createJob = asyncHandler(async (req, res) => {
  const job = await Job.create({
    title: req.body.title,
    company: req.body.company,
    location: req.body.location,
    salary: req.body.salary,
    experienceRequired: req.body.experienceRequired,
    description: req.body.description,
    skillsRequired: req.body.skillsRequired || [],
    createdBy: req.user._id,
    isActive: true,     
    isApproved: true
  });

  if (job.skillsRequired && job.skillsRequired.length > 0) {
    const matchingUsers = await User.find({
      role: "user",
      $or: [
        { skills: { $in: job.skillsRequired } },
        { "parsedData.skills": { $in: job.skillsRequired } }
      ]
    });

    for (const u of matchingUsers) {
      const notifyUser = await Notification.create({
        userId: u._id,
        type: "job",
        message: `A new job "${job.title}" matching your skills was just posted!`
      });
      const userSocket = getReceiverSocketId(u._id.toString());
      if (userSocket) {
        io.to(userSocket).emit("new_job_match", notifyUser);
        io.to(userSocket).emit("new_notification", notifyUser);
      }
    }
  }

  res.status(201).json({ message: "Job created successfully", job });
});

export const updateJob = asyncHandler(async (req, res) => {
  const jobId = req.params.id;
  const recruiterId = req.user._id;

  const job = await Job.findOne({ _id: jobId, createdBy: recruiterId });

  if (!job) {
    res.status(404);
    throw new Error("Job not found or you are not allowed to edit it.");
  }

  if (req.body.title) job.title = req.body.title;
  if (req.body.company) job.company = req.body.company;
  if (req.body.location) job.location = req.body.location;
  if (req.body.salary) job.salary = req.body.salary;
  if (req.body.experienceRequired) job.experienceRequired = req.body.experienceRequired;
  if (req.body.description) job.description = req.body.description;
  
  if (Array.isArray(req.body.skillsRequired)) {
    job.skillsRequired = req.body.skillsRequired;
  }

  await job.save();

  res.json({ message: "Job updated successfully", job });
});

export const getJobs = asyncHandler(async (req, res) => {
  const filters = {};

  if (req.user && req.user.role === "recruiter") {
    filters.createdBy = req.user._id;
  } else {
    filters.isActive = true;
    filters.isApproved = true;
  }

  const jobs = await Job.find(filters)
    .sort({ createdAt: -1 })
    .populate("createdBy", "name email");

  const jobsWithMatch = [];

  for (let i = 0; i < jobs.length; i++) {
    let jobObj = jobs[i].toObject();

    if (req.user && req.user.role === "user") {
      let userSkills = [];
      
      if (req.user.skills && req.user.skills.length > 0) {
        userSkills = req.user.skills;
      } else if (req.user.parsedData && req.user.parsedData.skills) {
        userSkills = req.user.parsedData.skills;
      }

      const jobSkills = jobObj.skillsRequired || [];
      
      const matchResult = calculateJobMatch(userSkills, jobSkills);

      jobObj.matchedSkills = matchResult.matchedSkills;
      jobObj.matchScore = matchResult.score;
    }

    jobsWithMatch.push(jobObj);
  }

  res.json(jobsWithMatch);
});

export const getSingleJob = asyncHandler(async (req, res) => {
  const jobId = req.params.id;

  const job = await Job.findById(jobId).populate("createdBy", "name email");

  if (!job) {
    res.status(404);
    throw new Error("Job not found.");
  }

  res.json(job);
});

export const closeJob = asyncHandler(async (req, res) => {
  const jobId = req.params.id;
  const recruiterId = req.user._id;

  const job = await Job.findOne({ _id: jobId, createdBy: recruiterId });

  if (!job) {
    res.status(404);
    throw new Error("Job not found or you are not allowed to close it.");
  }

  job.isActive = false;
  await job.save();

  res.json({ message: "Job closed successfully", job });
});

export const updateJobStatus = asyncHandler(async (req, res) => {
  const jobId = req.params.id;
  const recruiterId = req.user._id;

  if (typeof req.body.isActive !== "boolean") {
    res.status(400);
    throw new Error("isActive must be provided as true or false.");
  }

  const job = await Job.findOne({ _id: jobId, createdBy: recruiterId });

  if (!job) {
    res.status(404);
    throw new Error("Job not found or you are not allowed to update it.");
  }

  job.isActive = req.body.isActive;
  await job.save();

  res.json({
    message: job.isActive === true ? "Job activated successfully" : "Job deactivated successfully",
    job: job
  });
});