import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getStats = asyncHandler(async (req, res) => {
  const isPrivileged = req.user.role === "admin" || req.user.role === "manager";

  const projectFilter = isPrivileged
    ? {}
    : { $or: [{ owner: req.user._id }, { members: req.user._id }] };

  const accessibleProjects = await Project.find(projectFilter).select("_id");
  const projectIds = accessibleProjects.map((p) => p._id);

  const taskFilter = isPrivileged ? {} : { project: { $in: projectIds } };

  const [
    projectsTotal,
    projectsActive,
    projectsCompleted,
    tasksTotal,
    tasksByStatus,
    tasksByPriority,
    myTasks,
    overdueTasks,
    usersTotal,
    recentTasks,
  ] = await Promise.all([
    Project.countDocuments(projectFilter),
    Project.countDocuments({ ...projectFilter, status: "active" }),
    Project.countDocuments({ ...projectFilter, status: "completed" }),
    Task.countDocuments(taskFilter),
    Task.aggregate([
      { $match: taskFilter.project ? { project: { $in: projectIds } } : {} },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Task.aggregate([
      { $match: taskFilter.project ? { project: { $in: projectIds } } : {} },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]),
    Task.countDocuments({ ...taskFilter, assignee: req.user._id }),
    Task.countDocuments({
      ...taskFilter,
      dueDate: { $lt: new Date() },
      status: { $ne: "done" },
    }),
    isPrivileged ? User.countDocuments() : Promise.resolve(null),
    Task.find(taskFilter)
      .populate("assignee", "name email avatarUrl")
      .populate("project", "name color")
      .sort({ updatedAt: -1 })
      .limit(8),
  ]);

  // Build last 7 days completion trend
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const start = new Date(today);
    start.setDate(start.getDate() - i);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    days.push({ start, end, label: start.toISOString().slice(0, 10) });
  }
  const completionTrend = await Promise.all(
    days.map(async ({ start, end, label }) => {
      const count = await Task.countDocuments({
        ...taskFilter,
        status: "done",
        completedAt: { $gte: start, $lt: end },
      });
      return { date: label, completed: count };
    })
  );

  const statusMap = { todo: 0, in_progress: 0, review: 0, done: 0 };
  tasksByStatus.forEach((s) => (statusMap[s._id] = s.count));

  const priorityMap = { low: 0, medium: 0, high: 0, urgent: 0 };
  tasksByPriority.forEach((p) => (priorityMap[p._id] = p.count));

  res.json({
    success: true,
    data: {
      projects: {
        total: projectsTotal,
        active: projectsActive,
        completed: projectsCompleted,
      },
      tasks: {
        total: tasksTotal,
        byStatus: statusMap,
        byPriority: priorityMap,
        mine: myTasks,
        overdue: overdueTasks,
      },
      users: usersTotal,
      completionTrend,
      recentTasks,
    },
  });
});
