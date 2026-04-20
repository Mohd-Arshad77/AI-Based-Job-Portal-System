import Run from "../models/Run.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getResumeRuns = asyncHandler(async (req, res) => {
  const runs = await Run.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json(runs);
});
