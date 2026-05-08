import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function canManageProject(user, project) {
  if (user.role === "admin") return true;
  if (project.owner.toString() === user._id.toString()) return true;
  if (user.role === "manager") return true;
  return false;
}

function canViewProject(user, project) {
  if (user.role === "admin" || user.role === "manager") return true;
  if (project.owner.toString() === user._id.toString()) return true;
  return project.members.some((m) => m.toString() === user._id.toString());
}

export const listProjects = asyncHandler(async (req, res) => {
  const { status, priority, search } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (req.user.role === "member") {
    filter.$and = [{
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    }];
  }

  const projects = await Project.find(filter)
    .populate("owner", "name email avatarUrl role")
    .populate("members", "name email avatarUrl role")
    .populate("taskCount")
    .sort({ updatedAt: -1 });

  res.json({ success: true, data: { projects } });
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("owner", "name email avatarUrl role")
    .populate("members", "name email avatarUrl role")
    .populate("taskCount");
  if (!project) throw ApiError.notFound("Project not found");
  if (!canViewProject(req.user, project)) {
    throw ApiError.forbidden("You do not have access to this project");
  }
  res.json({ success: true, data: { project } });
});

export const createProject = asyncHandler(async (req, res) => {
  const data = { ...req.body, owner: req.user._id };
  if (!data.members) data.members = [];
  if (!data.members.includes(req.user._id.toString())) {
    data.members = [req.user._id, ...data.members];
  }
  const project = await Project.create(data);
  const populated = await Project.findById(project._id)
    .populate("owner", "name email avatarUrl role")
    .populate("members", "name email avatarUrl role")
    .populate("taskCount");
  res.status(201).json({ success: true, data: { project: populated } });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw ApiError.notFound("Project not found");
  if (!canManageProject(req.user, project)) {
    throw ApiError.forbidden("Only project owner, managers, or admin can update");
  }
  Object.assign(project, req.body);
  await project.save();
  const populated = await Project.findById(project._id)
    .populate("owner", "name email avatarUrl role")
    .populate("members", "name email avatarUrl role")
    .populate("taskCount");
  res.json({ success: true, data: { project: populated } });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw ApiError.notFound("Project not found");
  if (!canManageProject(req.user, project)) {
    throw ApiError.forbidden("Only project owner, managers, or admin can delete");
  }
  await Task.deleteMany({ project: project._id });
  await project.deleteOne();
  res.json({ success: true, message: "Project deleted" });
});
