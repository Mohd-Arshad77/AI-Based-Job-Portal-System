import express from "express";
import { closeJob, createJob, getJobs, getSingleJob, updateJob, updateJobStatus } from "../controllers/jobController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(protect, getJobs)
  .post(protect, authorizeRoles("recruiter"), createJob);

router.get("/:id", getSingleJob);
router.put("/:id", protect, authorizeRoles("recruiter"), updateJob);
router.patch("/:id/close", protect, authorizeRoles("recruiter"), closeJob);
router.patch("/:id/status", protect, authorizeRoles("recruiter"), updateJobStatus);

export default router;
