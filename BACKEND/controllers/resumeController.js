import { extractTextFromPDF } from "../services/pdfService.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { parseResumeText } from "../utils/resumeParser.js";

export const parseResume = asyncHandler(async (req, res) => {
  if (!req.file || req.file.mimetype !== "application/pdf") {
    res.status(400);
    throw new Error("Only PDF files are allowed.");
  }

  const text = await extractTextFromPDF(req.file.buffer);

  if (!text) {
    throw new Error("Failed to extract text");
  }

  const parsedData = parseResumeText(text);

  const updateQuery = {
    $set: { parsedData: parsedData }
  };

  if (parsedData.skills && parsedData.skills.length > 0) {
    updateQuery.$addToSet = {
      skills: { $each: parsedData.skills }
    };
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateQuery,
    { new: true }
  );

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  res.json({
    message: "Resume parsed successfully",
    parsedData: parsedData,
    resumeText: text
  });
});