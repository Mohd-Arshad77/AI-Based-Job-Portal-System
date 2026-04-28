import express from "express";
import {
  register,
  login,
  verifyUserOTP,
  logout,
  googleAuth
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyUserOTP);
router.post("/logout", logout);
router.post("/google", googleAuth);

export default router;