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
// നിലവിലുള്ള കോഡിന് താഴെ ഇത് ചേർക്കുക:

// @desc    Verify recruiter account and set new password
// @route   POST /api/auth/verify-recruiter
export const verifyRecruiter = asyncHandler(async (req, res) => {
  const { email, verificationCode, newPassword } = req.body;

  // 1. ഇമെയിൽ വെച്ച് റിക്രൂട്ടറെ കണ്ടുപിടിക്കുന്നു
  const user = await User.findOne({ email, role: "recruiter" }).select("+password");

  if (!user) {
    res.status(404);
    throw new Error("Recruiter not found");
  }

  // 2. അക്കൗണ്ട് ഇതിനോടകം വെരിഫൈഡ് ആണോ എന്ന് നോക്കുന്നു
  if (user.isVerified) {
    res.status(400);
    throw new Error("Account is already verified. Please login.");
  }

  // 3. കോഡ് ശരിയാണോ എന്ന് പരിശോധിക്കുന്നു
  if (user.verificationCode !== verificationCode) {
    res.status(400);
    throw new Error("Invalid verification code");
  }

  // 4. എല്ലാം ശരിയാണെങ്കിൽ പുതിയ പാസ്‌വേഡ് കൊടുത്ത് അക്കൗണ്ട് ആക്റ്റീവ് ആക്കുന്നു
  user.password = newPassword; // User model ഇത് തനിയെ എൻക്രിപ്റ്റ് ചെയ്തോളും
  user.isVerified = true;
  user.verificationCode = undefined; // വെരിഫൈ ചെയ്തതുകൊണ്ട് ഇനി കോഡ് ആവശ്യമില്ല

  await user.save();

  res.status(200).json({
    success: true,
    message: "Account verified successfully. You can now login.",
  });
});