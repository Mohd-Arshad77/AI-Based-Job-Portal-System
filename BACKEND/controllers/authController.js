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
  role: user.role
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

  if (!user) {
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

  res.cookie("accessToken", accessToken, { httpOnly: true });
  res.cookie("refreshToken", refreshToken, { httpOnly: true });

  res.json({
    success: true,
    token: accessToken,
    user: sanitizeUser(user)
  });
});

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
  const { name, email, password } = req.body;

  const normalizedEmail = email.toLowerCase().trim();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    if (!existingUser.isVerified) {
      existingUser.verificationCode = otp;
      await existingUser.save();

      await sendEmail({
        email: existingUser.email,
        subject: "OTP",
        html: `<h2>${otp}</h2>`
      });

      return res.json({
        success: true,
        requiresOTP: true,
        email: existingUser.email
      });
    }

    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await User.hashPassword(password);

  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    role: "user",
    isVerified: false,
    verificationCode: otp
  });

  await sendEmail({
    email: user.email,
    subject: "OTP",
    html: `<h2>${otp}</h2>`
  });

  res.json({
    success: true,
    requiresOTP: true,
    email: user.email
  });
});

export const verifyUserOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
    verificationCode: otp
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  user.isVerified = true;
  user.verificationCode = undefined;

  await user.save();

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("accessToken", accessToken, { httpOnly: true });
  res.cookie("refreshToken", refreshToken, { httpOnly: true });

  res.json({
    success: true,
    token: accessToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// ================= LOGIN =================
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

  if (!user) return res.status(401).json({ message: "User not found" });

  const match = await User.comparePassword(password, user.password);

  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  if (!user.isVerified) {
    return res.status(403).json({
      message: "Verify OTP first",
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
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (refreshToken) {
    await User.findOneAndUpdate({ refreshToken }, { $set: { refreshToken: null } });
  }

  const cookieOptions = getCookieOptions();
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  res.json({
    success: true,
    message: "Logged out successfully"
  });
});
