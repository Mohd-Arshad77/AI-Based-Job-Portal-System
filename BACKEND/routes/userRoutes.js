import express from "express";
import { getProfile, getRecommendedJobs, updateProfile, uploadResume } from "../controllers/userController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/profile", protect, authorizeRoles("user"), getProfile);
router.put("/profile", protect, authorizeRoles("user"), updateProfile);
router.post("/resume", protect, authorizeRoles("user"), upload.single("resume"), uploadResume);
router.get("/recommended-jobs", protect, authorizeRoles("user"), getRecommendedJobs);

export default router;
