import { body, param, query } from "express-validator";

const isObjectId = (v) => /^[0-9a-fA-F]{24}$/.test(v);

export const createTaskRules = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ min: 2, max: 200 }),
  body("description").optional().isLength({ max: 5000 }),
  body("status").optional().isIn(["todo", "in_progress", "review", "done"]),
  body("priority").optional().isIn(["low", "medium", "high", "urgent"]),
  body("project").custom(isObjectId).withMessage("Invalid project id"),
  body("assignee").optional({ nullable: true }).custom((v) => v === null || isObjectId(v))
    .withMessage("Invalid assignee id"),
  body("dueDate").optional().isISO8601().toDate(),
  body("tags").optional().isArray(),
  body("tags.*").optional().isString().isLength({ max: 32 }),
];

export const updateTaskRules = [
  param("id").custom(isObjectId).withMessage("Invalid task id"),
  body("title").optional().trim().isLength({ min: 2, max: 200 }),
  body("description").optional().isLength({ max: 5000 }),
  body("status").optional().isIn(["todo", "in_progress", "review", "done"]),
  body("priority").optional().isIn(["low", "medium", "high", "urgent"]),
  body("assignee").optional({ nullable: true }).custom((v) => v === null || isObjectId(v))
    .withMessage("Invalid assignee id"),
  body("dueDate").optional({ nullable: true }).custom((v) => v === null || !isNaN(Date.parse(v)))
    .withMessage("Invalid due date"),
  body("tags").optional().isArray(),
  body("tags.*").optional().isString().isLength({ max: 32 }),
];

export const idParamRule = [
  param("id").custom(isObjectId).withMessage("Invalid id"),
];

export const listTaskQueryRules = [
  query("status").optional().isIn(["todo", "in_progress", "review", "done"]),
  query("priority").optional().isIn(["low", "medium", "high", "urgent"]),
  query("project").optional().custom(isObjectId),
  query("assignee").optional().custom((v) => v === "me" || isObjectId(v)),
  query("search").optional().isString().isLength({ max: 200 }),
];
