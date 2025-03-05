import express from "express";
import { updateUserProfile } from "../controllers/profileController";
import { authenticateJWT } from "../middleware/authMiddleware";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.put(
  "/update",
  authenticateJWT,
  upload.single("avatar"),
  updateUserProfile
);

export default router;
