import express from "express";
import { 
  getDashboardStats, 
  inviteRecruiter,
  getAllUsers,
  toggleUserBlock,
  deleteUser,
  getAllJobs,
  toggleJobDisable,
  deleteJob
} from "../controllers/adminController.js"; 
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", protect, authorizeRoles("admin"), getDashboardStats);

router.post("/invite-recruiter", protect, authorizeRoles("admin"), inviteRecruiter);

// User Management Routes
router.get("/users", protect, authorizeRoles("admin"), getAllUsers);
router.put("/user/block/:id", protect, authorizeRoles("admin"), toggleUserBlock);
router.delete("/user/:id", protect, authorizeRoles("admin"), deleteUser);

// Job Management Routes
router.get("/jobs", protect, authorizeRoles("admin"), getAllJobs);
router.put("/job/disable/:id", protect, authorizeRoles("admin"), toggleJobDisable);
router.delete("/job/:id", protect, authorizeRoles("admin"), deleteJob);

export default router;