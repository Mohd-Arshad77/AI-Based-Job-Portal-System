import Application from "../models/Application.js";
import Interview from "../models/Interview.js";
import asyncHandler from "../utils/asyncHandler.js";
import sendEmail from "../utils/sendEmail.js";
import Notification from "../models/Notification.js";
import { io, getReceiverSocketId } from "../socket.js";

export const createInterview = asyncHandler(async (req, res) => {
  const { applicationId, scheduledAt, mode, meetingLink, location, notes } = req.body;

  if (!scheduledAt) {
    res.status(400);
    throw new Error("Interview date is required");
  }

  const application = await Application.findById(applicationId)
    .populate("user", "name email")
    .populate("job", "title");

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  const existing = await Interview.findOne({ application: applicationId });

  if (existing) {
    res.status(400);
    throw new Error("Interview already exists");
  }

  const interview = await Interview.create({
    application: applicationId,
    user: application.user._id, 
    job: application.job._id,   
    recruiter: req.user._id,
    scheduledAt,
    mode,
    meetingLink,
    location,
    notes,
    status: "Scheduled"
  });

  const interviewTime = new Date(scheduledAt).getTime();
  const tenMinutesBefore = interviewTime - 10 * 60 * 1000;
  const timeUntilReminder = tenMinutesBefore - Date.now();

  if (timeUntilReminder > 0) {
    setTimeout(async () => {
      try {
        const notifyUser = await Notification.create({
          userId: application.user._id,
          type: "interview",
          message: `Your interview for ${application.job.title} is starting in 10 minutes!`
        });
        const userSocket = getReceiverSocketId(application.user._id.toString());
        if (userSocket) {
          io.to(userSocket).emit("interview_reminder", notifyUser);
          io.to(userSocket).emit("new_notification", notifyUser);
        }
      } catch (err) {
        console.error("Reminder error", err);
      }
    }, timeUntilReminder);
  }

  application.status = "Interview";
  application.recruiter = req.user._id;
  await application.save();

  if (application.user && application.user.email) {
    const formattedDate = new Date(scheduledAt).toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = new Date(scheduledAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit', hour12: true });

    let modeDetailsHTML = "";
    if (mode === "Video Call") {
        modeDetailsHTML = `<p style="margin: 5px 0;"><strong>Meeting Link:</strong> <a href="${meetingLink}" style="color: #7D66FD; text-decoration: none; font-weight: bold;">Click here to join</a></p>`;
    } else if (mode === "Onsite") {
        modeDetailsHTML = `<p style="margin: 5px 0;"><strong>Location:</strong> ${location}</p>`;
    } else {
        modeDetailsHTML = `<p style="margin: 5px 0;"><strong>Mode:</strong> ${mode}</p>`;
    }

    sendEmail({
      email: application.user.email,
      subject: `Interview Scheduled: ${application.job.title} at JobFlow`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111827; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="padding: 30px; background-color: #ffffff;">
                <h2 style="color: #7D66FD; margin-top: 0; display: flex; align-items: center; font-size: 20px;">
                    <span style="background-color: #7D66FD; color: white; border-radius: 50%; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px;">📅</span> 
                    Interview Invitation
                </h2>
                
                <p style="font-size: 16px; line-height: 1.6; margin-top: 20px;">Dear ${application.user.name},</p>
                
                <p style="font-size: 16px; line-height: 1.6;">Congratulations! You have been selected for an interview for the <strong>${application.job.title}</strong> position.</p>
                
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #7D66FD;">
                    <h4 style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">Interview Details:</h4>
                    <p style="margin: 5px 0;"><strong>Date:</strong> ${formattedDate}</p>
                    <p style="margin: 5px 0;"><strong>Time:</strong> ${formattedTime}</p>
                    ${modeDetailsHTML}
                </div>
                
                <p style="font-size: 16px; line-height: 1.6;">Please be prepared and join 5 minutes prior to the scheduled time. If you have any questions, feel free to contact the recruiter via the JobFlow portal.</p>
                <br/>
                <p style="font-size: 16px;">Best Regards,<br><strong style="color: #7D66FD;">JobFlow Team</strong></p>
            </div>
        </div>
      `
    }).catch((err) => console.error("Interview Email Error:", err.message));
  }

  res.status(201).json({
    message: "Interview created",
    interview
  });
});


export const getInterviews = asyncHandler(async (req, res) => {
  const match = {};

  if (req.user.role === "recruiter") {
    match.recruiter = req.user._id;
  } else {
    match.user = req.user._id;
  }

  const interviews = await Interview.aggregate([
    { $match: match },

    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },

    {
      $lookup: {
        from: "jobs",
        localField: "job",
        foreignField: "_id",
        as: "job"
      }
    },
    { $unwind: "$job" },

    {
      $lookup: {
        from: "users",
        localField: "recruiter",
        foreignField: "_id",
        as: "recruiter"
      }
    },
    { $unwind: "$recruiter" },

    { $sort: { scheduledAt: 1 } }
  ]);

  res.json(interviews);
});


export const getInterviewById = asyncHandler(async (req, res) => {
  const match = { _id: req.params.id };

  if (req.user.role === "recruiter") {
    match.recruiter = req.user._id;
  } else {
    match.user = req.user._id;
  }

  const interview = await Interview.aggregate([
    { $match: match },

    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },

    {
      $lookup: {
        from: "jobs",
        localField: "job",
        foreignField: "_id",
        as: "job"
      }
    },
    { $unwind: "$job" },

    {
      $lookup: {
        from: "users",
        localField: "recruiter",
        foreignField: "_id",
        as: "recruiter"
      }
    },
    { $unwind: "$recruiter" }
  ]);

  if (!interview || interview.length === 0) {
    res.status(404);
    throw new Error("Interview not found");
  }

  res.json(interview[0]);
});


export const updateInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({
    _id: req.params.id,
    recruiter: req.user._id
  });

  if (!interview) {
    res.status(404);
    throw new Error("Interview not found");
  }

  if (req.body.scheduledAt) interview.scheduledAt = req.body.scheduledAt;
  if (req.body.mode) interview.mode = req.body.mode;
  if (req.body.meetingLink) interview.meetingLink = req.body.meetingLink;
  if (req.body.location) interview.location = req.body.location;
  if (req.body.notes !== undefined) interview.notes = req.body.notes;
  if (req.body.status) interview.status = req.body.status;

  await interview.save();

  res.json({
    message: "Interview updated",
    interview
  });
});