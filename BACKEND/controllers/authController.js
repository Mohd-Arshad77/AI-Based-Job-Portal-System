import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  skills: user.skills,
  experience: user.experience,
  education: user.education,
  resumeUrl: user.resumeUrl,
  parsedData: user.parsedData
});

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax"
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, skills, experience, education } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  const userExists = await User.findOne({ email: normalizedEmail });

  if (userExists && !userExists.isVerified) {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    userExists.verificationCode = newOtp;
    await userExists.save();

    await sendEmail({
      email: userExists.email,
      subject: "Verify Your Account - OTP",
      html: `<h2>Your OTP: ${newOtp}</h2>`
    });

    return res.json({ success: true, requiresOTP: true, email: userExists.email });
  }

  if (userExists && userExists.isVerified) {
    res.status(400);
    throw new Error("Account already exists");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
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
  const normalizedEmail = email?.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user || user.verificationCode !== otp) {
    res.status(400);
    throw new Error("Invalid OTP");
  }

  user.isVerified = true;
  user.verificationCode = undefined;

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
  const normalizedEmail = email?.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).select("+password +refreshToken");

  const isMatch = user && (await user.matchPassword(password));

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (!user.isVerified) {
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
    await User.findOneAndUpdate({ refreshToken }, { $set: { refreshToken: null } });
  }

  res.clearCookie("accessToken", getCookieOptions());
  res.clearCookie("refreshToken", getCookieOptions());

  res.json({ message: "Logout successful" });
});

export const verifyRecruiter = asyncHandler(async (req, res) => {
  const { email, verificationCode, newPassword } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail, role: "recruiter" }).select("+password");

  if (!user || user.verificationCode !== verificationCode) {
    res.status(400);
    throw new Error("Invalid verification code");
  }

  user.password = newPassword;
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
  const normalizedEmail = email?.trim().toLowerCase();

  let user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    const randomPassword = crypto.randomBytes(16).toString("hex");

    user = await User.create({
      name,
      email: normalizedEmail,
      password: randomPassword,
      role: "user",
      isVerified: true
    });
  } else if (!user.isVerified) {
  
    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("accessToken", accessToken, { ...getCookieOptions(), maxAge: 86400000 });
  res.cookie("refreshToken", refreshToken, { ...getCookieOptions(), maxAge: 604800000 });

  res.json({ success: true, token: accessToken, user: sanitizeUser(user) });
});