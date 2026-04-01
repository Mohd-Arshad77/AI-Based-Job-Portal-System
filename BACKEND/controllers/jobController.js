import Job from "../models/Job.js";
import asyncHandler from "../utils/asyncHandler.js";
import { calculateJobMatch } from "../utils/resumeParser.js";

export const createJob = asyncHandler(async (req, res) => {
  const job = await Job.create({
    ...req.body,
    skillsRequired: req.body.skillsRequired || [],
    createdBy: req.user._id
  });

  res.status(201).json({ message: "Job created successfully", job });
});

export const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error("Job not found.");
  }

  if (job.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only edit jobs you created.");
  }

  const { title, company, location, experienceRequired, skillsRequired, description } = req.body;

  job.title = title ?? job.title;
  job.company = company ?? job.company;
  job.location = location ?? job.location;
  job.experienceRequired = experienceRequired ?? job.experienceRequired;
  job.skillsRequired = Array.isArray(skillsRequired) ? skillsRequired : job.skillsRequired;
  job.description = description ?? job.description;

  await job.save();

  res.json({ message: "Job updated successfully", job });
});

export const getJobs = asyncHandler(async (req, res) => {
  const filters = {};

  if (req.user?.role === "recruiter") {
    filters.createdBy = req.user._id;
  } else {
    filters.isActive = true;
    filters.isApproved = true;
  }

  const jobs = await Job.find(filters).populate("createdBy", "name email").sort({ createdAt: -1 }).lean();

  const jobsWithMatch = req.user?.role === "user"
    ? jobs.map((job) => {
        const { matchedSkills, score } = calculateJobMatch(
          req.user.skills?.length ? req.user.skills : req.user.parsedData?.skills || [],
          job.skillsRequired || []
        );

        return { ...job, matchedSkills, matchScore: score };
      })
    : jobs;

  res.json(jobsWithMatch);
});

export const getSingleJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate("createdBy", "name email");

  if (!job) {
    res.status(404);
    throw new Error("Job not found.");
  }

  res.json(job);
});

export const closeJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error("Job not found.");
  }

  if (job.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only close jobs you created.");
  }

  job.isActive = false;
  await job.save();

  res.json({ message: "Job closed successfully", job });
});
