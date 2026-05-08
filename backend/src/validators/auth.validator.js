import { body } from "express-validator";

export const registerRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 80 }).withMessage("Name must be 2-80 characters"),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6, max: 64 }).withMessage("Password must be 6-64 characters"),
  body("role")
    .optional()
    .isIn(["admin", "manager", "member"]).withMessage("Invalid role"),
];

export const loginRules = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

export const updateProfileRules = [
  body("name").optional().trim().isLength({ min: 2, max: 80 }),
  body("title").optional().trim().isLength({ max: 80 }),
  body("avatarUrl").optional().trim().isLength({ max: 500 }),
];

export const changePasswordRules = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword").isLength({ min: 6, max: 64 }).withMessage("New password must be 6-64 characters"),
];
