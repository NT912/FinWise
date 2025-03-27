import express from "express";
import * as authController from "../controllers/authController";
import { Router } from "express";
import { authenticateJWT } from "../middleware/authMiddleware";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";

const router = express.Router();

router.post("/register", authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     fullName:
 *                       type: string
 *       400:
 *         description: Missing credentials
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */
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

// Thêm route để xác thực token
router.get("/verify", authenticateJWT, (req: AuthenticatedRequest, res) => {
  res.status(200).json({
    valid: true,
    message: "Token is valid",
    user: req.user,
  });
});

export default router;
