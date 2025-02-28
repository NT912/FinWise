import express from "express";
import {
  register,
  login,
  googleLogin,
  facebookLogin,
} from "../controllers/authController";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/facebook", facebookLogin);

export default router;
