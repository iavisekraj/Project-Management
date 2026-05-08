import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";

import Input from "../ui/Input.jsx";
import Textarea from "../ui/Textarea.jsx";
import Select from "../ui/Select.jsx";
import Button from "../ui/Button.jsx";
import { usersApi } from "../../api/users.api.js";
import { projectsApi } from "../../api/projects.api.js";

const schema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  description: z.string().max(5000).optional().or(z.literal("")),
  status: z.enum(["todo", "in_progress", "review", "done"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  project: z.string().min(1, "Project is required"),
  assignee: z.string().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
});

function toDateInput(d) {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export default function TaskForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Save",
  lockProject = false,
}) {
  const dv = defaultValues || {};

  const { data: projects = [] } = useQuery({
    queryKey: ["projects-light"],
    queryFn: () => projectsApi.list(),
  });
  const { data: users = [] } = useQuery({
    queryKey: ["users-light"],
    queryFn: () => usersApi.list(),
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: dv.title || "",
      description: dv.description || "",
      status: dv.status || "todo",
      priority: dv.priority || "medium",
      project: dv.project?._id || dv.project || "",
      assignee: dv.assignee?._id || dv.assignee || "",
      dueDate: toDateInput(dv.dueDate),
    },
  });

  const selectedProject = watch("project");

  // Limit assignee picker to project members + project owner
  const project = projects.find((p) => p._id === selectedProject);
  const candidateAssignees = (() => {
    if (!project) return users;
    const ids = new Set([
      project.owner?._id,
      ...(project.members || []).map((m) => m._id),
    ].filter(Boolean));
    return users.filter((u) => ids.has(u._id));
  })();

  const submit = (values) =>
    onSubmit({
      ...values,
      description: values.description || undefined,
      assignee: values.assignee || null,
      dueDate: values.dueDate || undefined,
    });

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
      <Input
        label="Title"
        placeholder="What needs to be done?"
        error={errors.title?.message}
        {...register("title")}
      />
      <Textarea
        label="Description"
        placeholder="Add more context, checklists, links…"
        rows={3}
        error={errors.description?.message}
        {...register("description")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          control={control}
          name="project"
          render={({ field }) => (
            <Select
              label="Project"
              {...field}
              disabled={lockProject}
              error={errors.project?.message}
            >
              <option value="">Select a project</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </Select>
          )}
        />
        <Controller
          control={control}
          name="assignee"
          render={({ field }) => (
            <Select label="Assignee" {...field}>
              <option value="">Unassigned</option>
              {candidateAssignees.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </Select>
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select
          label="Status"
          {...register("status")}
          options={[
            { value: "todo", label: "To Do" },
            { value: "in_progress", label: "In Progress" },
            { value: "review", label: "In Review" },
            { value: "done", label: "Done" },
          ]}
        />
        <Select
          label="Priority"
          {...register("priority")}
          options={[
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
            { value: "urgent", label: "Urgent" },
          ]}
        />
        <Input label="Due date" type="date" {...register("dueDate")} />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
