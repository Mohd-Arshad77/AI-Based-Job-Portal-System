import Run from "../models/Run.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getResumeRuns = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;

  const runs = await Run.find({ userId: currentUserId }).sort({ createdAt: -1 });

  res.json(runs);
});