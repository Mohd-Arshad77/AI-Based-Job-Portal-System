import Application from "../models/Application.js";
import Interview from "../models/Interview.js";
import asyncHandler from "../utils/asyncHandler.js";

const interviewPopulate = [
  {
    path: "application",
    populate: [
      { path: "user", select: "name email" },
      { path: "job", select: "title company location createdBy" }
    ]
  },
  { path: "user", select: "name email skills experience education" },
  { path: "job", select: "title company location skillsRequired createdBy" },
  { path: "recruiter", select: "name email" }
];

const getObjectIdString = (value) => {
  if (!value) return "";
  if (value._id) return value._id.toString();
  return value.toString();
};

const assertInterviewAccess = (interview, currentUser) => {
  if (currentUser.role === "recruiter" && getObjectIdString(interview.recruiter) === currentUser._id.toString()) {
    return true;
  }

  if (currentUser.role === "user" && getObjectIdString(interview.user) === currentUser._id.toString()) {
    return true;
  }

  return false;
};

export const createInterview = asyncHandler(async (req, res) => {
  const { applicationId, scheduledAt, mode, meetingLink, location, notes, status } = req.body;

  if (!applicationId) {
    res.status(400);
    throw new Error("applicationId is required.");
  }

  if (!scheduledAt) {
    res.status(400);
    throw new Error("scheduledAt is required.");
  }

  const application = await Application.findById(applicationId).populate("job");

  if (!application) {
    res.status(404);
    throw new Error("Application not found.");
  }

  if (!application.job) {
    res.status(400);
    throw new Error("Job not found for this application.");
  }

  if (application.job.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only schedule interviews for your own job applications.");
  }

  const existingInterview = await Interview.findOne({ application: application._id });

  if (existingInterview) {
    res.status(400);
    throw new Error("An interview already exists for this application.");
  }

  const interview = await Interview.create({
    application: application._id,
    user: application.user,
    job: application.job._id,
    recruiter: req.user._id,
    scheduledAt,
    mode,
    meetingLink,
    location,
    notes,
    status
  });

  if (application.status !== "Interview") {
    application.status = "Interview";
    await application.save();
  }

  await interview.populate(interviewPopulate);

  res.status(201).json({
    message: "Interview scheduled successfully",
    interview
  });
});

export const getInterviews = asyncHandler(async (req, res) => {
  const query = {};

  if (req.user.role === "recruiter") {
    query.recruiter = req.user._id;
  }

  if (req.user.role === "user") {
    query.user = req.user._id;
  }

  if (req.query.applicationId) {
    query.application = req.query.applicationId;
  }

  if (req.query.jobId) {
    query.job = req.query.jobId;
  }

  const interviews = await Interview.find(query)
    .populate(interviewPopulate)
    .sort({ scheduledAt: 1, createdAt: -1 });

  res.json(interviews);
});

export const getInterviewById = asyncHandler(async (req, res) => {
  const interview = await Interview.findById(req.params.id).populate(interviewPopulate);

  if (!interview) {
    res.status(404);
    throw new Error("Interview not found.");
  }

  if (!assertInterviewAccess(interview, req.user)) {
    res.status(403);
    throw new Error("You are not allowed to view this interview.");
  }

  res.json(interview);
});

export const updateInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findById(req.params.id).populate("application");

  if (!interview) {
    res.status(404);
    throw new Error("Interview not found.");
  }

  if (getObjectIdString(interview.recruiter) !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only update interviews you scheduled.");
  }

  const { scheduledAt, mode, meetingLink, location, notes, status } = req.body;

  interview.scheduledAt = scheduledAt ?? interview.scheduledAt;
  interview.mode = mode ?? interview.mode;
  interview.meetingLink = meetingLink ?? interview.meetingLink;
  interview.location = location ?? interview.location;
  interview.notes = notes ?? interview.notes;
  interview.status = status ?? interview.status;

  await interview.save();

  if (interview.application && interview.status === "Scheduled" && interview.application.status !== "Interview") {
    interview.application.status = "Interview";
    await interview.application.save();
  }

  await interview.populate(interviewPopulate);

  res.json({
    message: "Interview updated successfully",
    interview
  });
});
