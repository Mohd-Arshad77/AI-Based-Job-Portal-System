import fs from "fs/promises";
import path from "path";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import sendEmail from "../utils/sendEmail.js";

const saveResumeFile = async (file, userId) => {
  const uploadsDir = path.join(process.cwd(), "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const extension = path.extname(file.originalname || "") || ".pdf";
  const fileName = `${Date.now()}-${userId}${extension}`;
  const filePath = path.join(uploadsDir, fileName);

  await fs.writeFile(filePath, file.buffer);

  return `/uploads/${fileName}`;
};

const getEmailTemplate = (status, userName, jobTitle) => {
  const brandColor = "#7D66FD"; 

  if (status === "Applied") {
    return {
      subject: `Application Submitted: ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #2563eb; margin-top: 0; display: flex; align-items: center; font-size: 18px;">
              <span style="background-color: #2563eb; color: white; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px;">✓</span> 
              Application submitted
            </h2>
            <h1 style="color: #111827; font-size: 32px; font-weight: bold; margin-bottom: 20px; text-decoration: underline; text-decoration-color: ${brandColor}; text-underline-offset: 8px;">${jobTitle}</h1>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Hi ${userName},</p>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Your application has been successfully sent to the recruiter via <strong>JobFlow</strong>. We will notify you once they review your profile.</p>
            <br/>
            <p style="color: #4b5563; font-size: 16px;">Best of luck!</p>
          </div>
          <div style="background-color: #f9fafb; padding: 15px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">Powered by <strong>JobFlow</strong></p>
          </div>
        </div>
      `
    };
  }

  if (status === "Shortlisted") {
    return {
      subject: `Good News! You are shortlisted for ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111827; padding: 20px;">
          <h2 style="color: ${brandColor};">Congratulations, ${userName}! 🎉</h2>
          <p style="font-size: 16px; line-height: 1.6;">We are thrilled to inform you that your application for the position of <strong>${jobTitle}</strong> has been <strong>Shortlisted</strong>.</p>
          <p style="font-size: 16px; line-height: 1.6;">Your profile stood out to us, and the recruiter will be in touch soon to schedule an interview or discuss the next steps.</p>
          <p style="font-size: 16px; line-height: 1.6;">Keep an eye on your inbox!</p>
          <br>
          <p style="font-size: 16px;">Best Regards,<br><strong style="color: ${brandColor};">JobFlow Team</strong></p>
        </div>
      `
    };
  }

  if (status === "Rejected") {
    return {
      subject: `Update on your application for ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #374151; padding: 20px;">
          <p style="font-size: 15px; line-height: 1.6;">Dear ${userName},</p>
          <p style="font-size: 15px; line-height: 1.6;">Thank you for your application for the position of <strong>${jobTitle}</strong>.</p>
          <p style="font-size: 15px; line-height: 1.6;">I am very sorry to inform you that unfortunately we haven't shortlisted you for interview for this post. We had an exceptionally high number of applicants, of a high standard, and it was really challenging to shortlist just a small number of these.</p>
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="font-size: 14px; line-height: 1.6; margin: 0; color: #92400e;">
              Unfortunately, we don't have capacity to give feedback on candidates that haven't been interviewed. However, those who were short-listed were able to demonstrate the strongest evidence within their application that their experience and knowledge fitted the person specification. In general, we recommend giving as full a description as possible of how your experience and knowledge fits each of the attributes listed in the job requirements.
            </p>
          </div>
          <p style="font-size: 15px; line-height: 1.6;">Thank you once again for your interest in this role, and we hope you will consider applying for any further suitable vacancies we may recruit to in the future.</p>
          <br>
          <p style="font-size: 15px;">With best wishes,<br><strong>JobFlow Team</strong></p>
        </div>
      `
    };
  }

  return {
    subject: `Update on your application for ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #374151; padding: 20px;">
        <h3>Hi ${userName},</h3>
        <p style="font-size: 16px; line-height: 1.6;">Your application status for <strong>${jobTitle}</strong> has been updated to: <span style="color: ${brandColor}; font-weight: bold; background-color: #f3f0ff; padding: 4px 8px; border-radius: 4px;">${status}</span>.</p>
        <p style="font-size: 16px; line-height: 1.6;">Log in to your JobFlow dashboard for more details.</p>
        <br>
        <p>Best Regards,<br><strong>JobFlow Team</strong></p>
      </div>
    `
  };
};

export const applyJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({
    _id: req.params.jobId,
    isActive: true,
    isApproved: true
  }).lean();

  if (!job) {
    res.status(400); 
    throw new Error("This job is not accepting applications at the moment.");
  }

  const existingApplication = await Application.findOne({
    user: req.user._id,
    job: job._id
  }).lean();

  if (existingApplication) {
    res.status(400);
    throw new Error("You have already applied for this job.");
  }

  const currentUser = await User.findById(req.user._id);

  if (!currentUser) {
    res.status(404);
    throw new Error("User not found.");
  }

  if (!currentUser.resumeUrl && !req.file) {
    res.status(400);
    throw new Error("Please upload your resume before applying.");
  }

  const updates = {};

  if (req.body.name !== undefined) updates.name = req.body.name;
  if (req.body.phone !== undefined) updates.phone = req.body.phone;
  if (req.body.location !== undefined) updates.location = req.body.location;
  if (req.body.experience !== undefined) updates.experience = req.body.experience;

  if (req.file) {
    updates.resumeUrl = await saveResumeFile(req.file, req.user._id);
    updates.resumeUpdatedAt = new Date();
  }

  const user = Object.keys(updates).length > 0
    ? await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
    : currentUser;

  const application = await Application.create({
    user: req.user._id,
    job: job._id,
    status: "Pending",
    appliedAt: new Date()
  });

  if (user.email) {
    const emailOptions = getEmailTemplate("Applied", user.name, job.title);
    sendEmail({ email: user.email, ...emailOptions }).catch(() => {});
  }

  res.status(201).json({ 
    message: "Application submitted successfully", 
    application: application,
    user: user
  });
});

export const getApplications = asyncHandler(async (req, res) => {
  let query = {};

  if (req.user.role === "user") {
    query.user = req.user._id;
  } 
  else if (req.user.role === "recruiter") {
    const jobIds = await Job.find({ createdBy: req.user._id }).distinct("_id");
    query.job = { $in: jobIds };
  }

  const applications = await Application.find(query)
    .sort({ appliedAt: -1 })
    .populate("job", "title company location skillsRequired createdBy")
    .populate("user", "name email skills experience education resumeUrl phone location parsedData")
    .lean();

  res.json(applications);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const applicationId = req.params.id;
  const recruiterId = req.user._id;

  const validJobIds = await Job.find({ createdBy: recruiterId }).distinct("_id");

  const application = await Application.findOneAndUpdate(
    { _id: applicationId, job: { $in: validJobIds } },
    { $set: { status: req.body.status, recruiter: recruiterId } },
    { new: true }
  )
    .populate("job", "title")
    .populate("user", "name email");

  if (!application) {
    res.status(404);
    throw new Error("Application not found or you are not allowed to update it.");
  }

  if (application.user && application.user.email) {
    const emailOptions = getEmailTemplate(application.status, application.user.name, application.job.title);
    sendEmail({ email: application.user.email, ...emailOptions }).catch(() => {});
  }

  res.json({ 
    message: "Application status updated successfully", 
    application: application 
  });
});
