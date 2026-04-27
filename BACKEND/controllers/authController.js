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
    secure: isProd,           // HTTPS only in production
    sameSite: isProd ? "none" : "lax"  // "none" required for cross-origin (Vercel↔Render)
  };
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, skills, experience, education } = req.body;
  
  const normalizedEmail = email.toLowerCase().trim();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    if (existingUser.isVerified === false) {
      existingUser.verificationCode = otp;
      await existingUser.save();

      await sendEmail({
        email: existingUser.email,
        subject: "Verify Your Account - OTP",
        html: `<h2>Your OTP: ${otp}</h2>`
      });

      return res.json({ success: true, requiresOTP: true, email: existingUser.email });
    } else {
      res.status(400);
      throw new Error("Account already exists");
    }
  }

  const user = await User.create({
    name: name,
    email: normalizedEmail,
    password: password,
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

  res.json({ success: true, requiresOTP: true, email: user.email });
});

export const verifyUserOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ 
    email: normalizedEmail, 
    verificationCode: otp 
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid OTP");
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  await user.save();

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("accessToken", accessToken, { ...getCookieOptions(), maxAge: 86400000 });
  res.cookie("refreshToken", refreshToken, { ...getCookieOptions(), maxAge: 604800000 });

  res.json({ success: true, token: accessToken, user: sanitizeUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  console.log("LOGIN USER:", user.email, "ROLE:", user.role);
  console.log("BLOCK STATUS:", user.isBlocked);

  const isMatch = await User.comparePassword(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (user.isBlocked) {
    return res.status(403).json({ message: "Your account is blocked. Contact admin." });
  }

  if (user.isVerified === false) {
     return res.status(403).json({ 
        message: "Your account is not verified. Please check your email for the OTP.",
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

  res.json({ success: true, token: accessToken, user: sanitizeUser(user) });
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    const user = await User.findOne({ refreshToken: refreshToken });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
  }

  res.clearCookie("accessToken", getCookieOptions());
  res.clearCookie("refreshToken", getCookieOptions());

  res.json({ message: "Logout successful" });
});

export const verifyRecruiter = asyncHandler(async (req, res) => {
  const { email, verificationCode, newPassword } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  if (!newPassword || newPassword.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  const user = await User.findOne({ 
    email: normalizedEmail, 
    role: "recruiter", 
    verificationCode: verificationCode 
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid verification code");
  }

  const hashedPassword = await User.hashPassword(newPassword);
  
  user.password = hashedPassword;
  user.isVerified = true;
  user.verificationCode = undefined;
  
  await user.save();

  res.json({ success: true });
});

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
      return res.status(403).json({ message: "Your account has been blocked. Contact admin." });
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
      name: name,
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

  res.json({ success: true, token: accessToken, user: sanitizeUser(user) });
});
