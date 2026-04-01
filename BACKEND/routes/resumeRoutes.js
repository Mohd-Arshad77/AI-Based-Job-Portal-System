import express from "express";
import { parseResume } from "../controllers/resumeController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/parse", protect, upload.single("resume"), parseResume);

export default router;
