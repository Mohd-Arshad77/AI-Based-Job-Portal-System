import express from "express";
// മുകളിൽ verifyRecruiter കൂടി import ചെയ്യാൻ മറക്കരുത്
import { register, login, verifyRecruiter } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// പുതിയ വെരിഫിക്കേഷൻ റൂട്ട് (ഇത് ലോഗിൻ ചെയ്യാത്തവർക്കും ഉപയോഗിക്കാൻ പറ്റുന്ന public route ആണ്)
router.post("/verify-recruiter", verifyRecruiter);

export default router;