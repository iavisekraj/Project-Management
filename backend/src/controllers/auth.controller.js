import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { env } from "../config/env.js";

const REFRESH_COOKIE = "rt";

const cookieOptions = () => ({
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: env.nodeEnv === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/api/auth",
});

function issueTokens(res, user) {
  const payload = { sub: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions());
  return { accessToken };
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) throw ApiError.conflict("Email already registered");

  const userCount = await User.countDocuments();
  // First registered user becomes admin; otherwise default to member
  const finalRole = userCount === 0 ? "admin" : role && ["manager", "member"].includes(role) ? role : "member";

  const user = await User.create({ name, email, password, role: finalRole });
  const { accessToken } = issueTokens(res, user);

  res.status(201).json({
    success: true,
    message: "Account created",
    data: { user, accessToken },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !user.isActive) throw ApiError.unauthorized("Invalid credentials");

  const ok = await user.comparePassword(password);
  if (!ok) throw ApiError.unauthorized("Invalid credentials");

  const { accessToken } = issueTokens(res, user);
  user.password = undefined;

  res.json({
    success: true,
    message: "Logged in",
    data: { user, accessToken },
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw ApiError.unauthorized("Missing refresh token");

  try {
    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) throw ApiError.unauthorized("Invalid session");
    const { accessToken } = issueTokens(res, user);
    res.json({ success: true, data: { user, accessToken } });
  } catch (err) {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
  res.json({ success: true, message: "Logged out" });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, title, avatarUrl } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { ...(name !== undefined && { name }), ...(title !== undefined && { title }), ...(avatarUrl !== undefined && { avatarUrl }) },
    { new: true, runValidators: true }
  );
  res.json({ success: true, data: { user } });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  const ok = await user.comparePassword(currentPassword);
  if (!ok) throw ApiError.badRequest("Current password is incorrect");
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: "Password updated" });
});
