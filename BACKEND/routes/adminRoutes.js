import express from "express";
import {
  getDashboardStats,
  inviteRecruiter,
  getUsers,
  getRecruiters,
  toggleBlockUser,
  deleteUser,
  getJobs,
  toggleBlockJob,
  deleteJob
} from "../controllers/adminController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require admin authentication
router.use(protect, authorizeRoles("admin"));

// Dashboard
router.get("/stats", getDashboardStats);

// User management
router.get("/users", getUsers);
router.get("/recruiters", getRecruiters);
router.patch("/user/block/:id", toggleBlockUser);
router.delete("/user/:id", deleteUser);

// Job management
router.get("/jobs", getJobs);
router.patch("/job/block/:id", toggleBlockJob);
router.delete("/job/:id", deleteJob);

// Recruiter invitation
router.post("/invite-recruiter", inviteRecruiter);

export default router;