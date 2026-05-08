import { Router } from "express";
import {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/task.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createTaskRules,
  updateTaskRules,
  idParamRule,
  listTaskQueryRules,
} from "../validators/task.validator.js";

const router = Router();
router.use(requireAuth);

router.get("/", listTaskQueryRules, validate, listTasks);
router.get("/:id", idParamRule, validate, getTask);
router.post("/", createTaskRules, validate, createTask);
router.patch("/:id", updateTaskRules, validate, updateTask);
router.delete("/:id", idParamRule, validate, deleteTask);

export default router;
