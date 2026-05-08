import { Router } from "express";
import {
  listUsers,
  getUser,
  updateUserRole,
  setUserActive,
  deleteUser,
} from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";

const router = Router();

router.use(requireAuth);

// All authenticated users can view team list (for assignee/member pickers)
router.get("/", listUsers);
router.get("/:id", getUser);

// Admin only mutations
router.patch("/:id/role", requireRole("admin"), updateUserRole);
router.patch("/:id/active", requireRole("admin"), setUserActive);
router.delete("/:id", requireRole("admin"), deleteUser);

export default router;
