import { Router } from "express";
import { getStats } from "../controllers/dashboard.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
router.get("/stats", getStats);

export default router;
