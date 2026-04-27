import express from "express";
import { applyJob, getApplications, updateStatus } from "../controllers/applicationController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

import upload from "../middleware/uploadMiddleware.js"; 

const router = express.Router();

router.post("/:jobId", protect, authorizeRoles("user"), upload.single("resume"), applyJob);
router.get("/", protect, authorizeRoles("user", "recruiter"), getApplications);
router.patch("/:id/status", protect, authorizeRoles("recruiter"), updateStatus);

export default router;