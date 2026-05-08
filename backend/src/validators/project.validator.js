import { body, param, query } from "express-validator";

const isObjectId = (v) => /^[0-9a-fA-F]{24}$/.test(v);

export const createProjectRules = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2, max: 120 }),
  body("description").optional().isLength({ max: 2000 }),
  body("status").optional().isIn(["planning", "active", "on_hold", "completed", "archived"]),
  body("priority").optional().isIn(["low", "medium", "high", "urgent"]),
  body("color").optional().isString().isLength({ max: 16 }),
  body("startDate").optional().isISO8601().toDate(),
  body("dueDate").optional().isISO8601().toDate(),
  body("members").optional().isArray(),
  body("members.*").optional().custom(isObjectId).withMessage("Invalid member id"),
];

export const updateProjectRules = [
  param("id").custom(isObjectId).withMessage("Invalid project id"),
  body("name").optional().trim().isLength({ min: 2, max: 120 }),
  body("description").optional().isLength({ max: 2000 }),
  body("status").optional().isIn(["planning", "active", "on_hold", "completed", "archived"]),
  body("priority").optional().isIn(["low", "medium", "high", "urgent"]),
  body("color").optional().isString().isLength({ max: 16 }),
  body("startDate").optional().isISO8601().toDate(),
  body("dueDate").optional().isISO8601().toDate(),
  body("members").optional().isArray(),
  body("members.*").optional().custom(isObjectId).withMessage("Invalid member id"),
];

export const idParamRule = [
  param("id").custom(isObjectId).withMessage("Invalid id"),
];

export const listProjectQueryRules = [
  query("status").optional().isIn(["planning", "active", "on_hold", "completed", "archived"]),
  query("priority").optional().isIn(["low", "medium", "high", "urgent"]),
  query("search").optional().isString().isLength({ max: 120 }),
];
