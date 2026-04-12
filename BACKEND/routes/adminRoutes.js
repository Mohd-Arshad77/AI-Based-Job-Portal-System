import express from "express";
import { getDashboardStats, inviteRecruiter } from "../controllers/adminController.js"; 
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", protect, authorizeRoles("admin"), getDashboardStats);

router.post("/invite-recruiter", protect, authorizeRoles("admin"), inviteRecruiter);

export default router;