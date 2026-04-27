import User from "../models/User.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import asyncHandler from "../utils/asyncHandler.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

// ─── Dashboard Stats ───────────────────────────────────────────────
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalRecruiters, totalJobs, activeJobs, totalApplications] = await Promise.all([
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "recruiter" }),
    Job.countDocuments({}),
    Job.countDocuments({ isActive: true, status: { $ne: "blocked" } }),
    Application.countDocuments({})
  ]);

  res.json({
    totalUsers: totalUsers || 0,
    totalRecruiters: totalRecruiters || 0,
    totalJobs: totalJobs || 0,
    activeJobs: activeJobs || 0,
    totalApplications: totalApplications || 0,
  });
});

// ─── Get Users (role = "user") ─────────────────────────────────────
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "user" })
    .select("name email isBlocked createdAt")
    .sort({ createdAt: -1 })
    .lean();

  res.json(users);
});

// ─── Get Recruiters (role = "recruiter") ───────────────────────────
export const getRecruiters = asyncHandler(async (req, res) => {
  const recruiters = await User.find({ role: "recruiter" })
    .select("name email company isBlocked isVerified createdAt")
    .sort({ createdAt: -1 })
    .lean();

  res.json(recruiters);
});

// ─── Toggle Block/Unblock User ─────────────────────────────────────
export const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  if (user.role === "admin") {
    res.status(400);
    throw new Error("Cannot block an admin account.");
  }

  user.isBlocked = !user.isBlocked;
  await user.save();

  res.json({
    message: user.isBlocked ? "User blocked successfully" : "User unblocked successfully",
    isBlocked: user.isBlocked
  });
});

// ─── Delete User ───────────────────────────────────────────────────
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  if (user.role === "admin") {
    res.status(400);
    throw new Error("Cannot delete an admin account.");
  }

  await Application.deleteMany({ user: user._id });

  if (user.role === "recruiter") {
    const jobIds = await Job.find({ createdBy: user._id }).distinct("_id");
    await Application.deleteMany({ job: { $in: jobIds } });
    await Job.deleteMany({ createdBy: user._id });
  }

  await User.findByIdAndDelete(user._id);

  res.json({ message: "User deleted successfully" });
});

// ─── Get All Jobs ──────────────────────────────────────────────────
export const getJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({})
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .lean();

  console.log("TOTAL JOBS:", jobs.length);

  res.json(jobs);
});

// ─── Toggle Block/Unblock Job ──────────────────────────────────────
export const toggleBlockJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error("Job not found.");
  }

  if (job.status === "blocked") {
    job.status = "active";
    job.isActive = true;
  } else {
    job.status = "blocked";
    job.isActive = false;
  }

  await job.save();

  console.log("Job status:", job.status);
  console.log("isActive:", job.isActive);

  res.json({
    message: job.status === "active" ? "Job unblocked successfully" : "Job blocked successfully",
    status: job.status,
    isActive: job.isActive
  });
});

// ─── Delete Job ────────────────────────────────────────────────────
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error("Job not found.");
  }

  await Application.deleteMany({ job: job._id });
  await Job.findByIdAndDelete(job._id);

  res.json({ message: "Job deleted successfully" });
});

// ─── Invite Recruiter ──────────────────────────────────────────────
export const inviteRecruiter = asyncHandler(async (req, res) => {
  const { name, email, company } = req.body;
  
  if (!email) {
      res.status(400);
      throw new Error("Email is required.");
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  
  if (existingUser) {
    res.status(400);
    throw new Error("A user with this email already exists");
  }

  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const tempPassword = crypto.randomBytes(8).toString("hex");

  const recruiter = await User.create({
    name: name,
    email: normalizedEmail,
    password: tempPassword,
    role: "recruiter",
    company: company,
    isVerified: false,
    verificationCode: verificationCode,
  });

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const verificationLink = `${frontendUrl}/verify-recruiter?email=${recruiter.email}`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #4F46E5; text-align: center;">Welcome to JobFlow, ${name}!</h2>
      <p style="font-size: 16px; color: #333;">You have been invited by the Admin to join our platform as a Recruiter for <strong>${company}</strong>.</p>
      
      <div style="background-color: #f4f4f5; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #666;">Your Verification Code is:</p>
        <h1 style="margin: 10px 0; color: #1e293b; letter-spacing: 5px;">${verificationCode}</h1>
      </div>

      <p style="font-size: 14px; color: #555; text-align: center;">Please use this code to verify your account and set up your permanent password.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #4F46E5; color: #ffffff; padding: 12px 28px; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px; display: inline-block;">
          Verify & Login to JobFlow
        </a>
      </div>

      <br/>
      <p style="font-size: 12px; color: #999; text-align: center;">If you did not expect this invitation, please ignore this email.</p>
    </div>
  `;

  await sendEmail({
    email: recruiter.email,
    subject: "Invitation to join JobFlow as Recruiter",
    html: emailHtml,
  });

  res.status(201).json({
    success: true,
    message: "Recruiter invited successfully",
  });
});