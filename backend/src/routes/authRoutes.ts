import express from "express";
import * as authController from "../controllers/authController";
import { Router } from "express";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/google", authController.googleLogin as express.RequestHandler);
router.post(
  "/facebook",
  authController.facebookLogin as express.RequestHandler
);
router.post(
  "/forgot-password",
  authController.forgotPassword as express.RequestHandler
);
router.post(
  "/reset-password",
  authController.resetPassword as express.RequestHandler
);

export default router;
