import Application from "../models/Application.js";
import Interview from "../models/Interview.js";
import asyncHandler from "../utils/asyncHandler.js";
import sendEmail from "../utils/sendEmail.js";
import { compactUndefined, isDuplicateKeyError, notFoundObjectId, toObjectId } from "../utils/queryHelpers.js";

const userEmailProject = { name: 1, email: 1 };
const userProfileProject = { name: 1, email: 1, skills: 1, experience: 1, education: 1 };
const applicationJobProject = { title: 1, company: 1, location: 1, createdBy: 1 };
const interviewJobProject = { title: 1, company: 1, location: 1, skillsRequired: 1, createdBy: 1 };

const buildInterviewPipeline = ({ match, sort, limit }) => [
  { $match: match },
  ...(sort ? [{ $sort: sort }] : []),
  ...(limit ? [{ $limit: limit }] : []),
  {
    $lookup: {
      from: "applications",
      localField: "application",
      foreignField: "_id",
      pipeline: [
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            pipeline: [{ $project: userEmailProject }],
            as: "user"
          }
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "jobs",
            localField: "job",
            foreignField: "_id",
            pipeline: [{ $project: applicationJobProject }],
            as: "job"
          }
        },
        { $unwind: { path: "$job", preserveNullAndEmptyArrays: true } },
        { $project: { recruiter: 0 } }
      ],
      as: "application"
    }
  },
  { $unwind: { path: "$application", preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: "users",
      localField: "user",
      foreignField: "_id",
      pipeline: [{ $project: userProfileProject }],
      as: "user"
    }
  },
  { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: "jobs",
      localField: "job",
      foreignField: "_id",
      pipeline: [{ $project: interviewJobProject }],
      as: "job"
    }
  },
  { $unwind: { path: "$job", preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: "users",
      localField: "recruiter",
      foreignField: "_id",
      pipeline: [{ $project: userEmailProject }],
      as: "recruiter"
    }
  },
  { $unwind: { path: "$recruiter", preserveNullAndEmptyArrays: true } }
];

const buildApplicationAccessPipeline = (applicationId, recruiterId) => [
  { $match: { _id: applicationId } },
  { $limit: 1 },
  {
    $lookup: {
      from: "jobs",
      let: { jobId: "$job" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$_id", "$$jobId"] },
                { $eq: ["$createdBy", recruiterId] }
              ]
            }
          }
        },
        { $project: interviewJobProject }
      ],
      as: "job"
    }
  },
  { $unwind: "$job" },
  {
    $lookup: {
      from: "users",
      localField: "user",
      foreignField: "_id",
      pipeline: [{ $project: userProfileProject }],
      as: "user"
    }
  },
  { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
  { $project: { recruiter: 0 } }
];

const buildCreatedInterviewResponse = (interviewValue, application, recruiter) => {
  const interview = interviewValue.toObject?.() || interviewValue;
  const applicationJob = application.job
    ? {
        _id: application.job._id,
        title: application.job.title,
        company: application.job.company,
        location: application.job.location,
        createdBy: application.job.createdBy
      }
    : null;

  return {
    ...interview,
    application: {
      _id: application._id,
      user: application.user,
      job: applicationJob,
      status: "Interview",
      appliedAt: application.appliedAt,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      __v: application.__v
    },
    user: application.user,
    job: application.job,
    recruiter: {
      _id: recruiter._id,
      name: recruiter.name,
      email: recruiter.email
    }
  };
};

export const createInterview = asyncHandler(async (req, res) => {
  const { applicationId, scheduledAt, mode, meetingLink, location, notes, status } = req.body;
  const applicationObjectId = toObjectId(applicationId) || notFoundObjectId();
  const recruiterId = toObjectId(req.user._id) || notFoundObjectId();

  if (!scheduledAt) {
    res.status(400);
    throw new Error("Interview date and time is required.");
  }

  const [application] = await Application.aggregate(buildApplicationAccessPipeline(applicationObjectId, recruiterId));

  if (!application) {
    res.status(404);
    throw new Error("Application not found or you are not allowed to schedule interviews for it.");
  }

  const now = new Date();
  let interviewResult;
  try {
    interviewResult = await Interview.findOneAndUpdate(
      { application: application._id },
      {
        $setOnInsert: compactUndefined({
          application: application._id,
          user: application.user?._id,
          job: application.job?._id,
          recruiter: recruiterId,
          scheduledAt,
          mode,
          meetingLink,
          location,
          notes,
          status,
          createdAt: now,
          updatedAt: now
        })
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
        includeResultMetadata: true,
        timestamps: false
      }
    );
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      res.status(400);
      throw new Error("Interview is already scheduled for this application.");
    }
    throw error;
  }

  if (interviewResult.lastErrorObject?.updatedExisting) {
    res.status(400);
    throw new Error("Interview is already scheduled for this application.");
  }

  const applicationUpdatedAt = new Date();
  await Application.updateOne(
    { _id: application._id, status: { $ne: "Interview" } },
    { $set: { status: "Interview", recruiter: recruiterId, updatedAt: applicationUpdatedAt } },
    { runValidators: true, timestamps: false }
  );
  application.status = "Interview";
  application.updatedAt = applicationUpdatedAt;

  const interview = buildCreatedInterviewResponse(interviewResult.value, application, req.user);

  if (application.user?.email) {
    const interviewDate = new Date(interview.scheduledAt).toLocaleString();
    const modeDetails = interview.mode === "Video Call"
      ? `<p><strong>Meeting Link:</strong> <a href="${interview.meetingLink}" style="color: #7D66FD;">${interview.meetingLink}</a></p>`
      : `<p><strong>Location:</strong> ${interview.location}</p>`;

    sendEmail({
      email: application.user.email,
      subject: `Interview Scheduled: ${application.job.title} at JobFlow`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6;">
          <h3>Hi ${application.user.name},</h3>
          <p>Congratulations! You have been invited for an interview for the <strong>${application.job.title}</strong> position.</p>
          <div style="background-color: #f3f0ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h4 style="margin-top: 0; color: #7D66FD;">Interview Details:</h4>
            <p><strong>Date & Time:</strong> ${interviewDate}</p>
            <p><strong>Mode:</strong> ${interview.mode}</p>
            ${modeDetails}
          </div>
          <p>Please be prepared and log in/arrive 5 minutes early.</p>
          <br/>
          <p>Best Regards,</p>
          <p><strong>JobFlow Team</strong></p>
        </div>
      `
    }).catch((err) => console.error("Interview Email Error:", err.message));
  }

  res.status(201).json({
    message: "Interview scheduled successfully",
    interview
  });
});

export const getInterviews = asyncHandler(async (req, res) => {
  const currentUserId = toObjectId(req.user._id) || notFoundObjectId();
  const query = {};

  if (req.user.role === "recruiter") {
    query.recruiter = currentUserId;
  }

  if (req.user.role === "user") {
    query.user = currentUserId;
  }

  if (req.query.applicationId) {
    query.application = toObjectId(req.query.applicationId) || notFoundObjectId();
  }

  if (req.query.jobId) {
    query.job = toObjectId(req.query.jobId) || notFoundObjectId();
  }

  const interviews = await Interview.aggregate(buildInterviewPipeline({
    match: query,
    sort: { scheduledAt: 1, createdAt: -1 }
  }));

  res.json(interviews);
});

export const getInterviewById = asyncHandler(async (req, res) => {
  const interviewId = toObjectId(req.params.id) || notFoundObjectId();
  const currentUserId = toObjectId(req.user._id) || notFoundObjectId();
  const accessFilter = {
    _id: interviewId,
    ...(
      req.user.role === "recruiter"
        ? { recruiter: currentUserId }
        : req.user.role === "user"
          ? { user: currentUserId }
          : { _id: notFoundObjectId() }
    )
  };

  const [interview] = await Interview.aggregate(buildInterviewPipeline({
    match: accessFilter,
    limit: 1
  }));

  if (!interview) {
    res.status(404);
    throw new Error("Interview not found or you are not allowed to view it.");
  }

  res.json(interview);
});

export const updateInterview = asyncHandler(async (req, res) => {
  const interviewId = toObjectId(req.params.id) || notFoundObjectId();
  const recruiterId = toObjectId(req.user._id) || notFoundObjectId();
  const { scheduledAt, mode, meetingLink, location, notes, status } = req.body;
  const updateFields = compactUndefined({
    scheduledAt,
    mode,
    meetingLink,
    location,
    notes,
    status
  });

  if (!Object.keys(updateFields).length) {
    res.status(400);
    throw new Error("No valid interview fields provided.");
  }

  const interview = await Interview.findOneAndUpdate(
    { _id: interviewId, recruiter: recruiterId },
    { $set: updateFields },
    { new: true, runValidators: true }
  ).lean();

  if (!interview) {
    res.status(404);
    throw new Error("Interview not found or you are not allowed to update it.");
  }

  if (interview.application && interview.status === "Scheduled") {
    await Application.updateOne(
      { _id: interview.application, status: { $ne: "Interview" } },
      { $set: { status: "Interview", recruiter: recruiterId, updatedAt: new Date() } },
      { runValidators: true, timestamps: false }
    );
  }

  const [updatedInterview] = await Interview.aggregate(buildInterviewPipeline({
    match: { _id: interview._id, recruiter: recruiterId },
    limit: 1
  }));

  res.json({
    message: "Interview updated successfully",
    interview: updatedInterview
  });
});
