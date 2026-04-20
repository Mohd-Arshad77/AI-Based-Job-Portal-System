import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto"; 
import { isDuplicateKeyError, normalizeEmail } from "../utils/queryHelpers.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [stats] = await User.aggregate([
    {
      $facet: {
        roles: [
          { $group: { _id: "$role", count: { $sum: 1 } } }
        ]
      }
    },
    {
      $lookup: {
        from: "jobs",
        pipeline: [{ $count: "count" }],
        as: "jobs"
      }
    },
    {
      $lookup: {
        from: "applications",
        pipeline: [{ $count: "count" }],
        as: "applications"
      }
    },
    {
      $project: {
        roleCounts: {
          $arrayToObject: {
            $map: {
              input: "$roles",
              as: "role",
              in: { k: "$$role._id", v: "$$role.count" }
            }
          }
        },
        totalJobs: { $ifNull: [{ $arrayElemAt: ["$jobs.count", 0] }, 0] },
        totalApplications: { $ifNull: [{ $arrayElemAt: ["$applications.count", 0] }, 0] }
      }
    },
    {
      $project: {
        totalUsers: { $ifNull: ["$roleCounts.user", 0] },
        totalRecruiters: { $ifNull: ["$roleCounts.recruiter", 0] },
        totalJobs: 1,
        totalApplications: 1
      }
    }
  ]);

  res.json({
    totalUsers: stats?.totalUsers || 0,
    totalRecruiters: stats?.totalRecruiters || 0,
    totalJobs: stats?.totalJobs || 0,
    totalApplications: stats?.totalApplications || 0,
  });
}); 

export const inviteRecruiter = asyncHandler(async (req, res) => {
  const { name, email, company } = req.body;
  const normalizedEmail = normalizeEmail(email);

  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const tempPassword = crypto.randomBytes(8).toString("hex");

  let recruiter;
  try {
    recruiter = await User.create({
      name,
      email: normalizedEmail,
      password: tempPassword,
      role: "recruiter",
      company,
      isVerified: false,
      verificationCode,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      res.status(400);
      throw new Error("A user with this email already exists");
    }
    throw error;
  }

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
