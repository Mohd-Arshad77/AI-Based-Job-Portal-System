import Application from "../models/Application.js";
import Interview from "../models/Interview.js";
import asyncHandler from "../utils/asyncHandler.js";
import sendEmail from "../utils/sendEmail.js";

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

  const application = await Application.findById(applicationId)
    .populate("job")
    .populate("user", "name email");


  const interview = await Interview.create({
    application: application._id,
    user: application.user._id, 
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

  if (application.user && application.user.email) {
    const interviewDate = new Date(scheduledAt).toLocaleString();
    const modeDetails = mode === "Online" 
      ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}" style="color: #7D66FD;">${meetingLink}</a></p>` 
      : `<p><strong>Location:</strong> ${location}</p>`;

    const emailOptions = {
      email: application.user.email,
      subject: `Interview Scheduled: ${application.job.title} at JobFlow`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6;">
          <h3>Hi ${application.user.name},</h3>
          <p>Congratulations! You have been invited for an interview for the <strong>${application.job.title}</strong> position.</p>
          <div style="background-color: #f3f0ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h4 style="margin-top: 0; color: #7D66FD;">Interview Details:</h4>
            <p><strong>Date & Time:</strong> ${interviewDate}</p>
            <p><strong>Mode:</strong> ${mode}</p>
            ${modeDetails}
          </div>
          <p>Please be prepared and log in/arrive 5 minutes early.</p>
          <br/>
          <p>Best Regards,</p>
          <p><strong>JobFlow Team</strong></p>
        </div>
      `,
    };

    sendEmail(emailOptions).catch((err) => console.error("Interview Email Error:", err.message));
  }

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
