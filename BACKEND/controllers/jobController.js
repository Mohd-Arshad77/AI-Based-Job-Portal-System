import Job from "../models/Job.js";
import asyncHandler from "../utils/asyncHandler.js";
import { calculateJobMatch } from "../utils/resumeParser.js";
import { buildSetUpdate, hasSetFields, notFoundObjectId, toObjectId } from "../utils/queryHelpers.js";

export const createJob = asyncHandler(async (req, res) => {
  const job = await Job.create({
    ...req.body,
    skillsRequired: req.body.skillsRequired || [],
    createdBy: req.user._id,
    isActive: true,     
    isApproved: true
  });

  res.status(201).json({ message: "Job created successfully", job });
});

export const updateJob = asyncHandler(async (req, res) => {
  const { title, company, location, salary, experienceRequired, skillsRequired, description } = req.body;

  const update = buildSetUpdate({
    title,
    company,
    location,
    salary,
    experienceRequired,
    skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : undefined,
    description
  });

  if (!hasSetFields(update)) {
    res.status(400);
    throw new Error("No valid job fields provided.");
  }

  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.user._id },
    update,
    { new: true, runValidators: true }
  ).lean();

  if (!job) {
    res.status(404);
    throw new Error("Job not found or you are not allowed to edit it.");
  }

  res.json({ message: "Job updated successfully", job });
});

export const getJobs = asyncHandler(async (req, res) => {
  const filters = {};

  if (req.user?.role === "recruiter") {
    filters.createdBy = toObjectId(req.user._id) || notFoundObjectId();
  } else {
    filters.isActive = true;
    filters.isApproved = true;
  }

  const jobs = await Job.aggregate([
    { $match: filters },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        pipeline: [{ $project: { name: 1, email: 1 } }],
        as: "createdBy"
      }
    },
    { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } }
  ]);

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
  const jobId = toObjectId(req.params.id) || notFoundObjectId();
  const [job] = await Job.aggregate([
    { $match: { _id: jobId } },
    { $limit: 1 },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        pipeline: [{ $project: { name: 1, email: 1 } }],
        as: "createdBy"
      }
    },
    { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } }
  ]);

  if (!job) {
    res.status(404);
    throw new Error("Job not found.");
  }

  res.json(job);
});

export const closeJob = asyncHandler(async (req, res) => {
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.user._id },
    { $set: { isActive: false } },
    { new: true, runValidators: true }
  ).lean();

  if (!job) {
    res.status(404);
    throw new Error("Job not found or you are not allowed to close it.");
  }

  res.json({ message: "Job closed successfully", job });
});

export const updateJobStatus = asyncHandler(async (req, res) => {
  if (typeof req.body.isActive !== "boolean") {
    res.status(400);
    throw new Error("isActive must be provided as true or false.");
  }

  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.user._id },
    { $set: { isActive: req.body.isActive } },
    { new: true, runValidators: true }
  ).lean();

  if (!job) {
    res.status(404);
    throw new Error("Job not found or you are not allowed to update it.");
  }

  res.json({
    message: job.isActive ? "Job activated successfully" : "Job deactivated successfully",
    job
  });
});
