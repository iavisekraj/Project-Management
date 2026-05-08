import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Plus,
  Calendar,
  Users as UsersIcon,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckSquare,
} from "lucide-react";

import PageHeader from "../components/layout/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import Modal from "../components/ui/Modal.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card.jsx";
import { StatusPill, PriorityPill } from "../components/ui/StatusBadge.jsx";
import Avatar, { AvatarGroup } from "../components/ui/Avatar.jsx";
import RoleGate from "../components/auth/RoleGate.jsx";

import TaskBoard from "../components/tasks/TaskBoard.jsx";
import TaskForm from "../components/tasks/TaskForm.jsx";
import ProjectForm from "../components/projects/ProjectForm.jsx";

import { projectsApi } from "../api/projects.api.js";
import { tasksApi } from "../api/tasks.api.js";
import { getApiError } from "../api/client.js";
import { fmtDate } from "../utils/format.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, hasRole } = useAuth();

  const [taskModal, setTaskModal] = useState({ open: false, task: null, defaultStatus: null });
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: project, isLoading: projectLoading, isError: projectError } = useQuery({
    queryKey: ["project", id],
    queryFn: () => projectsApi.get(id),
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", { project: id }],
    queryFn: () => tasksApi.list({ project: id }),
    enabled: !!id,
  });

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    return {
      total,
      done,
      progress: total === 0 ? 0 : Math.round((done / total) * 100),
    };
  }, [tasks]);

  const canManage =
    hasRole("admin", "manager") ||
    project?.owner?._id === user?._id;

  const createTaskMut = useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => {
      toast.success("Task created");
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["project", id] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setTaskModal({ open: false, task: null, defaultStatus: null });
    },
    onError: (err) => toast.error(getApiError(err)),
  });

  const updateTaskMut = useMutation({
    mutationFn: ({ id, payload }) => tasksApi.update(id, payload),
    onSuccess: () => {
      toast.success("Task updated");
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setTaskModal({ open: false, task: null, defaultStatus: null });
    },
    onError: (err) => toast.error(getApiError(err)),
  });

  const deleteTaskMut = useMutation({
    mutationFn: tasksApi.remove,
    onSuccess: () => {
      toast.success("Task deleted");
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setTaskModal({ open: false, task: null, defaultStatus: null });
    },
    onError: (err) => toast.error(getApiError(err)),
  });

  const updateProjectMut = useMutation({
    mutationFn: (payload) => projectsApi.update(id, payload),
    onSuccess: () => {
      toast.success("Project updated");
      qc.invalidateQueries({ queryKey: ["project", id] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      setEditProjectOpen(false);
    },
    onError: (err) => toast.error(getApiError(err)),
  });

  const deleteProjectMut = useMutation({
    mutationFn: () => projectsApi.remove(id),
    onSuccess: () => {
      toast.success("Project deleted");
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      navigate("/projects");
    },
    onError: (err) => toast.error(getApiError(err)),
  });

  const handleStatusDrop = (taskId, newStatus) => {
    updateTaskMut.mutate({ id: taskId, payload: { status: newStatus } });
  };

  if (projectLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Project not found"
        description="It may have been deleted or you don't have access."
        action={
          <Button variant="secondary" onClick={() => navigate("/projects")}>
            Back to projects
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        All projects
      </Link>

      <PageHeader
        title={
          <span className="inline-flex items-center gap-3">
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: project.color }}
            />
            {project.name}
          </span>
        }
        description={project.description}
        actions={
          <div className="flex items-center gap-2">
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() =>
                setTaskModal({ open: true, task: null, defaultStatus: "todo" })
              }
            >
              Add task
            </Button>
            {canManage && (
              <>
                <Button
                  variant="secondary"
                  leftIcon={<Pencil className="h-4 w-4" />}
                  onClick={() => setEditProjectOpen(true)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  leftIcon={<Trash2 className="h-4 w-4" />}
                  onClick={() => setConfirmDelete(true)}
                  className="text-rose-600 hover:bg-rose-50"
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Status
            </p>
            <div className="mt-2">
              <StatusPill status={project.status} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Priority
            </p>
            <div className="mt-2">
              <PriorityPill priority={project.priority} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Due date
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900 inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-slate-400" />
              {fmtDate(project.dueDate)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Progress
              </p>
              <span className="text-sm font-semibold text-slate-900">
                {stats.progress}%
              </span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500 inline-flex items-center gap-1.5">
              <CheckSquare className="h-3.5 w-3.5" />
              {stats.done}/{stats.total} tasks done
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Board</CardTitle>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            ) : (
              <TaskBoard
                tasks={tasks}
                onTaskClick={(task) =>
                  setTaskModal({ open: true, task, defaultStatus: null })
                }
                onAddTask={(status) =>
                  setTaskModal({ open: true, task: null, defaultStatus: status })
                }
                onStatusChange={handleStatusDrop}
                canEdit
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <UsersIcon className="h-4 w-4 text-slate-400" />
              Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <AvatarGroup users={project.members || []} max={6} size="md" />
            </div>
            <ul className="space-y-3">
              {[project.owner, ...(project.members || []).filter((m) => m._id !== project.owner?._id)]
                .filter(Boolean)
                .map((m) => (
                  <li key={m._id} className="flex items-center gap-3">
                    <Avatar name={m.name} src={m.avatarUrl} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {m.name}
                        {m._id === project.owner?._id && (
                          <span className="ml-1.5 text-[10px] uppercase tracking-wide font-bold text-brand-600">
                            owner
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{m.email}</p>
                    </div>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Modal
        open={taskModal.open}
        onClose={() => setTaskModal({ open: false, task: null, defaultStatus: null })}
        title={taskModal.task ? "Edit task" : "New task"}
        size="lg"
      >
        <TaskForm
          lockProject
          submitLabel={taskModal.task ? "Save changes" : "Create task"}
          defaultValues={
            taskModal.task
              ? taskModal.task
              : { project: id, status: taskModal.defaultStatus || "todo" }
          }
          onCancel={() => setTaskModal({ open: false, task: null, defaultStatus: null })}
          onSubmit={(values) =>
            taskModal.task
              ? updateTaskMut.mutateAsync({ id: taskModal.task._id, payload: values })
              : createTaskMut.mutateAsync(values)
          }
        />
        {taskModal.task && (
          <RoleGate allow={["admin", "manager"]}>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <Button
                variant="ghost"
                leftIcon={<Trash2 className="h-4 w-4" />}
                onClick={() => {
                  if (window.confirm("Delete this task?")) {
                    deleteTaskMut.mutate(taskModal.task._id);
                  }
                }}
                className="text-rose-600 hover:bg-rose-50"
              >
                Delete task
              </Button>
            </div>
          </RoleGate>
        )}
      </Modal>

      <Modal
        open={editProjectOpen}
        onClose={() => setEditProjectOpen(false)}
        title="Edit project"
        size="lg"
      >
        <ProjectForm
          defaultValues={project}
          submitLabel="Save changes"
          onCancel={() => setEditProjectOpen(false)}
          onSubmit={(values) => updateProjectMut.mutateAsync(values)}
        />
      </Modal>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete project?"
        description="This will permanently delete the project and all its tasks. This cannot be undone."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteProjectMut.isPending}
              onClick={() => deleteProjectMut.mutate()}
            >
              Delete project
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete <b>{project.name}</b>?
        </p>
      </Modal>
    </div>
  );
}
