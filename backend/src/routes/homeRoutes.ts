import express from "express";
import { getHomeData } from "../controllers/homeController";
import { authenticateJWT } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/home", authenticateJWT, getHomeData);

export default router;
