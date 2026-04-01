import express from "express";
import { getProfile, getRecommendedJobs, updateProfile, uploadResume } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/resume", protect, upload.single("resume"), uploadResume);
router.get("/recommended-jobs", protect, getRecommendedJobs);

export default router;
