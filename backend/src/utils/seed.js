import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { connectDB } from "../config/db.js";

async function run() {
  await connectDB();

  console.log("[seed] clearing collections...");
  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({}),
  ]);

  console.log("[seed] creating users...");
  const admin = await User.create({
    name: "Aman Admin",
    email: "admin@pm.app",
    password: "admin123",
    role: "admin",
    title: "Founder",
  });
  const manager = await User.create({
    name: "Maya Manager",
    email: "manager@pm.app",
    password: "manager123",
    role: "manager",
    title: "Engineering Manager",
  });
  const member1 = await User.create({
    name: "Dev Demo",
    email: "dev@pm.app",
    password: "dev12345",
    role: "member",
    title: "Frontend Engineer",
  });
  const member2 = await User.create({
    name: "Sara Designer",
    email: "sara@pm.app",
    password: "sara12345",
    role: "member",
    title: "Product Designer",
  });

  console.log("[seed] creating projects...");
  const p1 = await Project.create({
    name: "Website Redesign",
    description: "Marketing website refresh with new branding and CMS migration.",
    status: "active",
    priority: "high",
    color: "#6366f1",
    owner: manager._id,
    members: [manager._id, member1._id, member2._id],
    startDate: new Date(),
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  });
  const p2 = await Project.create({
    name: "Mobile App v2",
    description: "Rewrite the iOS/Android app with React Native and shared design system.",
    status: "planning",
    priority: "urgent",
    color: "#ec4899",
    owner: admin._id,
    members: [admin._id, member1._id],
    startDate: new Date(),
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
  });
  const p3 = await Project.create({
    name: "Internal Analytics",
    description: "Set up internal dashboards for product and sales metrics.",
    status: "on_hold",
    priority: "medium",
    color: "#10b981",
    owner: manager._id,
    members: [manager._id, member2._id],
  });

  console.log("[seed] creating tasks...");
  const tasks = [
    { title: "Audit current site IA", project: p1._id, status: "done", priority: "medium", assignee: member2._id, createdBy: manager._id },
    { title: "Design new homepage hero", project: p1._id, status: "in_progress", priority: "high", assignee: member2._id, createdBy: manager._id, dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5) },
    { title: "Implement homepage hero", project: p1._id, status: "todo", priority: "high", assignee: member1._id, createdBy: manager._id, dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9) },
    { title: "CMS schema for blog posts", project: p1._id, status: "review", priority: "medium", assignee: member1._id, createdBy: manager._id },
    { title: "SEO audit report", project: p1._id, status: "todo", priority: "low", createdBy: manager._id },

    { title: "Spec navigation flows", project: p2._id, status: "in_progress", priority: "high", assignee: member1._id, createdBy: admin._id, dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3) },
    { title: "Set up React Native monorepo", project: p2._id, status: "todo", priority: "urgent", assignee: member1._id, createdBy: admin._id },
    { title: "Auth screens", project: p2._id, status: "todo", priority: "high", createdBy: admin._id },
    { title: "Push notifications POC", project: p2._id, status: "done", priority: "medium", assignee: member1._id, createdBy: admin._id },

    { title: "Pick analytics warehouse", project: p3._id, status: "todo", priority: "medium", createdBy: manager._id },
    { title: "Define KPIs with sales", project: p3._id, status: "todo", priority: "high", assignee: member2._id, createdBy: manager._id, dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) },
  ];
  await Task.insertMany(tasks);

  console.log("\n[seed] done. Login with:");
  console.log("  admin@pm.app   / admin123");
  console.log("  manager@pm.app / manager123");
  console.log("  dev@pm.app     / dev12345");
  console.log("  sara@pm.app    / sara12345");

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
