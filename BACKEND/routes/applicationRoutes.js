import express from "express";
import { applyJob, getApplications, updateStatus } from "../controllers/applicationController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:jobId", protect, authorizeRoles("user"), applyJob);
router.get("/", protect, getApplications);
router.patch("/:id/status", protect, authorizeRoles("recruiter"), updateStatus);

export default router;
