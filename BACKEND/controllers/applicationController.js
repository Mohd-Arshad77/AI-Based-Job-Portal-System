import Application from "../models/Application.js";
import Job from "../models/Job.js";
import asyncHandler from "../utils/asyncHandler.js";

export const applyJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);

  if (!job || !job.isActive || !job.isApproved) {
    res.status(400);
    throw new Error("This job is not accepting applications.");
  }

  const existingApplication = await Application.findOne({ user: req.user._id, job: job._id });
  if (existingApplication) {
    res.status(400);
    throw new Error("You have already applied for this job.");
  }

  const application = await Application.create({ user: req.user._id, job: job._id });

  res.status(201).json({ message: "Application submitted successfully", application });
});

export const getApplications = asyncHandler(async (req, res) => {
  let query = {};

  if (req.user.role === "user") {
    query = { user: req.user._id };
  }

  if (req.user.role === "recruiter") {
    const jobs = await Job.find({ createdBy: req.user._id }).select("_id");
    query = { job: { $in: jobs.map((job) => job._id) } };
  }

  const applications = await Application.find(query)
    .populate("user", "name email skills experience education")
    .populate("job", "title company location skillsRequired createdBy")
    .sort({ appliedAt: -1 });

  res.json(applications);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id).populate("job");

  if (!application) {
    res.status(404);
    throw new Error("Application not found.");
  }

  if (application.job.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only manage applications for your jobs.");
  }

  application.status = req.body.status;
  await application.save();

  res.json({ message: "Application status updated successfully", application });
});
