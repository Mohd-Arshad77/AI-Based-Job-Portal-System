import express from "express";
import { closeJob, createJob, getJobs, getSingleJob, updateJob } from "../controllers/jobController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getJobs);
router.get("/:id", getSingleJob);
router.post("/", protect, authorizeRoles("recruiter"), createJob);
router.put("/:id", protect, authorizeRoles("recruiter"), updateJob);
router.patch("/:id/close", protect, authorizeRoles("recruiter"), closeJob);

export default router;
