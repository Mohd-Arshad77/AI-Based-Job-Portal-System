import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getResumeRuns } from "../controllers/runController.js";

const router = express.Router();

router.get("/", protect, getResumeRuns);

export default router;
