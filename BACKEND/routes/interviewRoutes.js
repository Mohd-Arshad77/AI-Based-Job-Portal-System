import express from "express";
import {
  createInterview,
  getInterviewById,
  getInterviews,
  updateInterview
} from "../controllers/interviewController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .post(protect, authorizeRoles("recruiter"), createInterview)
  .get(protect, getInterviews);

router.route("/:id")
  .get(protect, getInterviewById)
  .put(protect, authorizeRoles("recruiter"), updateInterview);

export default router;
