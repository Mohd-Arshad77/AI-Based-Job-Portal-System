import { extractTextFromPDF } from "../services/pdfService.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { parseResumeText } from "../utils/resumeParser.js";

export const parseResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Resume PDF is required.");
  }

  const text = await extractTextFromPDF(req.file.buffer);
  const parsedData = parseResumeText(text);
  const user = await User.findById(req.user._id);

  user.parsedData = parsedData;
  user.skills = [...new Set([...(user.skills || []), ...(parsedData.skills || [])])];
  await user.save();

  res.json({ message: "Resume parsed successfully", parsedData, resumeText: text });
});
