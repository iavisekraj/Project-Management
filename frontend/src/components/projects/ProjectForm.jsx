import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";

import Input from "../ui/Input.jsx";
import Textarea from "../ui/Textarea.jsx";
import Select from "../ui/Select.jsx";
import Button from "../ui/Button.jsx";
import Avatar from "../ui/Avatar.jsx";
import { usersApi } from "../../api/users.api.js";
import { cn } from "../../utils/cn.js";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(120),
  description: z.string().max(2000).optional().or(z.literal("")),
  status: z.enum(["planning", "active", "on_hold", "completed", "archived"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  color: z.string(),
  startDate: z.string().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
  members: z.array(z.string()).default([]),
});

const COLOR_SWATCHES = [
  "#6366f1",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#3b82f6",
  "#8b5cf6",
  "#ef4444",
  "#14b8a6",
];

function toDateInput(d) {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export default function ProjectForm({ defaultValues, onSubmit, onCancel, submitLabel = "Save" }) {
  const dv = defaultValues || {};
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
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: dv.name || "",
      description: dv.description || "",
      status: dv.status || "active",
      priority: dv.priority || "medium",
      color: dv.color || "#6366f1",
      startDate: toDateInput(dv.startDate),
      dueDate: toDateInput(dv.dueDate),
      members: (dv.members || []).map((m) => m._id || m),
    },
  });

  const selectedColor = watch("color");
  const selectedMembers = watch("members") || [];

  const submit = (values) => {
    const payload = {
      ...values,
      description: values.description || undefined,
      startDate: values.startDate || undefined,
      dueDate: values.dueDate || undefined,
    };
    return onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
      <Input
        label="Project name"
        placeholder="e.g. Website Redesign"
        error={errors.name?.message}
        {...register("name")}
      />
      <Textarea
        label="Description"
        placeholder="What is this project about?"
        rows={3}
        error={errors.description?.message}
        {...register("description")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Status"
          {...register("status")}
          options={[
            { value: "planning", label: "Planning" },
            { value: "active", label: "Active" },
            { value: "on_hold", label: "On hold" },
            { value: "completed", label: "Completed" },
            { value: "archived", label: "Archived" },
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Start date" type="date" {...register("startDate")} />
        <Input label="Due date" type="date" {...register("dueDate")} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Color</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setValue("color", c, { shouldDirty: true })}
              className={cn(
                "h-8 w-8 rounded-lg ring-2 ring-offset-2 transition",
                selectedColor === c ? "ring-slate-900" : "ring-transparent"
              )}
              style={{ backgroundColor: c }}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>
      </div>

      <Controller
        control={control}
        name="members"
        render={({ field }) => (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Members
            </label>
            <div className="rounded-lg border border-slate-200 bg-white p-2 max-h-56 overflow-y-auto scrollbar-thin">
              {users.length === 0 ? (
                <p className="text-sm text-slate-500 px-2 py-3">No users available.</p>
              ) : (
                users.map((u) => {
                  const checked = selectedMembers.includes(u._id);
                  return (
                    <label
                      key={u._id}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-2 py-2 cursor-pointer transition",
                        checked ? "bg-brand-50" : "hover:bg-slate-50"
                      )}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        checked={checked}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...selectedMembers, u._id]
                            : selectedMembers.filter((id) => id !== u._id);
                          field.onChange(next);
                        }}
                      />
                      <Avatar name={u.name} src={u.avatarUrl} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{u.name}</p>
                        <p className="text-xs text-slate-500 truncate">{u.email}</p>
                      </div>
                      <span className="text-[11px] uppercase tracking-wide font-semibold text-slate-400">
                        {u.role}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        )}
      />

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
