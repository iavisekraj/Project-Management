import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listUsers = asyncHandler(async (req, res) => {
  const { search = "", role } = req.query;
  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (role) filter.role = role;

  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: { users } });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound("User not found");
  res.json({ success: true, data: { user } });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!["admin", "manager", "member"].includes(role)) {
    throw ApiError.badRequest("Invalid role");
  }
  if (req.user._id.toString() === req.params.id && role !== "admin") {
    throw ApiError.badRequest("You cannot demote yourself");
  }
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  );
  if (!user) throw ApiError.notFound("User not found");
  res.json({ success: true, data: { user } });
});

export const setUserActive = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  if (req.user._id.toString() === req.params.id) {
    throw ApiError.badRequest("You cannot deactivate yourself");
  }
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: !!isActive },
    { new: true }
  );
  if (!user) throw ApiError.notFound("User not found");
  res.json({ success: true, data: { user } });
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (req.user._id.toString() === req.params.id) {
    throw ApiError.badRequest("You cannot delete yourself");
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw ApiError.notFound("User not found");
  res.json({ success: true, message: "User deleted" });
});
