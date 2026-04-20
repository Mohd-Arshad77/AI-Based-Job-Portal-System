import express from "express";
import { 
  register, 
  login, 
  logout, 
  verifyRecruiter, 
  googleAuth ,
  verifyUserOTP
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-recruiter", verifyRecruiter);
router.post("/verify-otp", verifyUserOTP);

router.post("/google", googleAuth);

export default router;