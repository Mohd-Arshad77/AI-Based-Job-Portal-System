import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

const sanitizeUser = (user) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    location: user.location,
    role: user.role,
    skills: user.skills,
    experience: user.experience,
    education: user.education,
    resumeUrl: user.resumeUrl,
    resumeUpdatedAt: user.resumeUpdatedAt,
    parsedData: user.parsedData
  };
};

const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax"
  };
};



// ================= REGISTER =================
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, skills, experience, education } = req.body;

  const normalizedEmail = email.toLowerCase().trim();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    if (!existingUser.isVerified) {
      existingUser.verificationCode = otp;
      await existingUser.save();

      await sendEmail({
        email: existingUser.email,
        subject: "Verify Your Account - OTP",
        html: `<h2>Your OTP: ${otp}</h2>`
      });

      return res.json({
        success: true,
        message: "OTP sent successfully",
        requiresOTP: true,
        email: existingUser.email
      });
    } else {
      return res.status(400).json({ message: "Account already exists" });
    }
  }

  // 🔥 FIX: HASH PASSWORD
  const hashedPassword = await User.hashPassword(password);

  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword, // ✅ FIXED
    role: "user",
    isVerified: false,
    verificationCode: otp,
    skills: skills || [],
    experience: experience || "",
    education: education || ""
  });

  await sendEmail({
    email: user.email,
    subject: "Verify Your Account - OTP",
    html: `<h2>Your OTP: ${otp}</h2>`
  });

  return res.status(201).json({
    success: true,
    message: "Registered successfully",
    requiresOTP: true,
    email: user.email
  });
});



// ================= VERIFY OTP =================
export const verifyUserOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({
    email: normalizedEmail,
    verificationCode: otp
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  user.isVerified = true;
  user.verificationCode = undefined;

  await user.save();

  res.json({ success: true, message: "OTP verified successfully" });
});



// ================= LOGIN =================
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  const isMatch = await User.comparePassword(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (user.isBlocked) {
    return res.status(403).json({ message: "Your account is blocked" });
  }

  if (!user.isVerified) {
    return res.status(403).json({
      message: "Please verify OTP first",
      requiresOTP: true,
      email: user.email
    });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("accessToken", accessToken, { ...getCookieOptions(), maxAge: 86400000 });
  res.cookie("refreshToken", refreshToken, { ...getCookieOptions(), maxAge: 604800000 });

  res.json({
    success: true,
    token: accessToken,
    user: sanitizeUser(user)
  });
});



// ================= LOGOUT =================
export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    const user = await User.findOne({ refreshToken });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
  }

  res.clearCookie("accessToken", getCookieOptions());
  res.clearCookie("refreshToken", getCookieOptions());

  res.json({ message: "Logout successful" });
});



// ================= GOOGLE AUTH =================
export const googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  const { email, name } = ticket.getPayload();
  const normalizedEmail = email.toLowerCase().trim();

  let user = await User.findOne({ email: normalizedEmail });

  if (user) {
    if (user.isBlocked) {
      return res.status(403).json({ message: "Account blocked" });
    }

    if (!user.isVerified) {
      user.isVerified = true;
      user.verificationCode = undefined;
      await user.save();
    }
  } else {
    const randomPassword = crypto.randomBytes(16).toString("hex");
    const hashedPassword = await User.hashPassword(randomPassword);

    user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
      isVerified: true
    });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("accessToken", accessToken, { ...getCookieOptions(), maxAge: 86400000 });
  res.cookie("refreshToken", refreshToken, { ...getCookieOptions(), maxAge: 604800000 });

  res.json({
    success: true,
    token: accessToken,
    user: sanitizeUser(user)
  });
});