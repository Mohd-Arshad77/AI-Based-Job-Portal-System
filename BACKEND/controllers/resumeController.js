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

  const updateResult = await User.updateOne(
    { _id: req.user._id },
    {
      $set: { parsedData },
      $addToSet: { skills: { $each: parsedData.skills || [] } }
    },
    { runValidators: true }
  );

  if (updateResult.matchedCount === 0) {
    res.status(404);
    throw new Error("User not found.");
  }

  res.json({ message: "Resume parsed successfully", parsedData, resumeText: text });
});
