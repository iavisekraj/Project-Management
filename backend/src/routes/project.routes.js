import { Router } from "express";
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/project.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import {
  createProjectRules,
  updateProjectRules,
  idParamRule,
  listProjectQueryRules,
} from "../validators/project.validator.js";

const router = Router();
router.use(requireAuth);

router.get("/", listProjectQueryRules, validate, listProjects);
router.get("/:id", idParamRule, validate, getProject);
router.post(
  "/",
  requireRole("admin", "manager"),
  createProjectRules,
  validate,
  createProject
);
router.patch("/:id", updateProjectRules, validate, updateProject);
router.delete("/:id", idParamRule, validate, deleteProject);

export default router;
