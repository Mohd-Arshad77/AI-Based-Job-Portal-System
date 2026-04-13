import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";

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

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax"
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, skills, experience, education } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(400);
    throw new Error("User already exists.");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: "user",
    skills: skills || [],
    experience: experience || "",
    education: education || ""
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 });
  res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

  res.status(201).json({ message: "Registration successful", token: accessToken, user: sanitizeUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password +refreshToken");

  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password"
    });
  }

  console.log("Entered password:", password);
  console.log("Stored password:", user.password);

  const isMatch = await user.matchPassword(password);
  console.log("Password match:", isMatch);

  if (!isMatch) {
    return res.status(401).json({
      message: "Invalid email or password"
    });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 });
  res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

  res.json({ message: "Login successful", token: accessToken, user: sanitizeUser(user) });
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    await User.findOneAndUpdate({ refreshToken }, { $set: { refreshToken: null } });
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ message: "Logout successful" });
});

export const verifyRecruiter = asyncHandler(async (req, res) => {
  const { email, verificationCode, newPassword } = req.body;

  const user = await User.findOne({ email, role: "recruiter" }).select("+password");

  if (!user) {
    res.status(404);
    throw new Error("Recruiter not found");
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error("Account is already verified. Please login.");
  }

  if (user.verificationCode !== verificationCode) {
    res.status(400);
    throw new Error("Invalid verification code");
  }

  user.password = newPassword;
  user.isVerified = true;
  user.verificationCode = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Account verified successfully. You can now login.",
  });
});
