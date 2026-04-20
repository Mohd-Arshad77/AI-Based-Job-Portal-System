import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import { isDuplicateKeyError, normalizeEmail } from "../utils/queryHelpers.js";

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
  const normalizedEmail = normalizeEmail(email);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const unverifiedUser = await User.findOneAndUpdate(
    { email: normalizedEmail, isVerified: false },
    { $set: { verificationCode: otp } },
    { new: true, runValidators: true }
  ).lean();

  if (unverifiedUser) {
    await sendEmail({
      email: unverifiedUser.email,
      subject: "Verify Your Account - OTP",
      html: `<h2>Your OTP: ${otp}</h2>`
    });

    return res.json({ success: true, requiresOTP: true, email: unverifiedUser.email });
  }

  let user;
  try {
    user = await User.create({
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
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      res.status(400);
      throw new Error("Account already exists");
    }
    throw error;
  }

  await sendEmail({
    email: user.email,
    subject: "Verify Your Account - OTP",
    html: `<h2>Your OTP: ${otp}</h2>`
  });

  res.json({ success: true, requiresOTP: true, email: user.email });
});

export const verifyUserOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = normalizeEmail(email);

  const user = await User.findOneAndUpdate(
    { email: normalizedEmail, verificationCode: otp },
    {
      $set: { isVerified: true },
      $unset: { verificationCode: "" }
    },
    { new: true, runValidators: true }
  ).lean();

  if (!user) {
    res.status(400);
    throw new Error("Invalid OTP");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await User.updateOne({ _id: user._id }, { $set: { refreshToken } });

  res.cookie("accessToken", accessToken, { ...getCookieOptions(), maxAge: 86400000 });
  res.cookie("refreshToken", refreshToken, { ...getCookieOptions(), maxAge: 604800000 });

  res.json({ success: true, token: accessToken, user: sanitizeUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  const user = await User.findOne({ email: normalizedEmail }).select("+password").lean();

  const isMatch = user && (await User.comparePassword(password, user.password));

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

  await User.updateOne({ _id: user._id }, { $set: { refreshToken } });

  res.cookie("accessToken", accessToken, { ...getCookieOptions(), maxAge: 86400000 });
  res.cookie("refreshToken", refreshToken, { ...getCookieOptions(), maxAge: 604800000 });

  res.json({ success: true, token: accessToken, user: sanitizeUser(user) });
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    await User.updateOne({ refreshToken }, { $set: { refreshToken: null } });
  }

  res.clearCookie("accessToken", getCookieOptions());
  res.clearCookie("refreshToken", getCookieOptions());

  res.json({ message: "Logout successful" });
});

export const verifyRecruiter = asyncHandler(async (req, res) => {
  const { email, verificationCode, newPassword } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!newPassword || newPassword.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  const hashedPassword = await User.hashPassword(newPassword);
  const user = await User.findOneAndUpdate(
    { email: normalizedEmail, role: "recruiter", verificationCode },
    {
      $set: { password: hashedPassword, isVerified: true },
      $unset: { verificationCode: "" }
    },
    { new: true, runValidators: true }
  ).lean();

  if (!user) {
    res.status(400);
    throw new Error("Invalid verification code");
  }

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
  const normalizedEmail = normalizeEmail(email);
  const randomPassword = crypto.randomBytes(16).toString("hex");
  const hashedPassword = await User.hashPassword(randomPassword);

  const user = await User.findOneAndUpdate(
    { email: normalizedEmail },
    {
      $set: { isVerified: true },
      $unset: { verificationCode: "" },
      $setOnInsert: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: "user"
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  ).lean();

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await User.updateOne({ _id: user._id }, { $set: { refreshToken } });

  res.cookie("accessToken", accessToken, { ...getCookieOptions(), maxAge: 86400000 });
  res.cookie("refreshToken", refreshToken, { ...getCookieOptions(), maxAge: 604800000 });

  res.json({ success: true, token: accessToken, user: sanitizeUser(user) });
});
