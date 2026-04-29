import { extractTextFromPDF } from "../services/pdfService.js";
import asyncHandler from "../utils/asyncHandler.js";
import { parseResumeText } from "../utils/resumeParser.js";

/**
 * POST /api/resume/parse
 * Issue 1 Fix: PURE extraction only — does NOT write to the DB.
 * Returns parsedData as JSON. The frontend must explicitly call
 * PUT /api/user/profile to persist the data.
 */
export const parseResume = asyncHandler(async (req, res) => {
  if (!req.file || req.file.mimetype !== "application/pdf") {
    res.status(400);
    throw new Error("Only PDF files are allowed.");
  }

  const text = await extractTextFromPDF(req.file.buffer);

  if (!text || !text.trim()) {
    res.status(422);
    throw new Error("Could not extract text from this PDF. The file may be image-based or corrupted.");
  }

  const parsedData = parseResumeText(text);

  // Return extracted data only — zero DB writes
  res.json({
    message: "Resume parsed successfully",
    parsedData: parsedData
  });
});