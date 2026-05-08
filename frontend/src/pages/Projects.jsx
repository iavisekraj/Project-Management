import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Search, FolderKanban, AlertTriangle } from "lucide-react";

import PageHeader from "../components/layout/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Modal from "../components/ui/Modal.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import RoleGate from "../components/auth/RoleGate.jsx";
import ProjectCard from "../components/projects/ProjectCard.jsx";
import ProjectForm from "../components/projects/ProjectForm.jsx";

import { projectsApi } from "../api/projects.api.js";
import { getApiError } from "../api/client.js";

export default function Projects() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const { data: projects = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["projects", { status, priority }],
    queryFn: () =>
      projectsApi.list({
        status: status || undefined,
        priority: priority || undefined,
      }),
  });

  const filtered = useMemo(() => {
    if (!search) return projects;
    const q = search.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
    );
  }, [projects, search]);

  const createMut = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      toast.success("Project created");
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setCreateOpen(false);
    },
    onError: (err) => toast.error(getApiError(err, "Failed to create project")),
  });

  return (
    <div>
      <PageHeader
        title="Projects"
        description="All the work you and your team are tracking, in one place."
        actions={
          <RoleGate allow={["admin", "manager"]}>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
              New project
            </Button>
          </RoleGate>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <Input
          placeholder="Search projects…"
          leftIcon={<Search className="h-4 w-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { value: "", label: "All statuses" },
            { value: "planning", label: "Planning" },
            { value: "active", label: "Active" },
            { value: "on_hold", label: "On hold" },
            { value: "completed", label: "Completed" },
            { value: "archived", label: "Archived" },
          ]}
        />
        <Select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          options={[
            { value: "", label: "All priorities" },
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
            { value: "urgent", label: "Urgent" },
          ]}
        />
      </div>

      {isError ? (
        <EmptyState
          icon={AlertTriangle}
          title="Couldn't load projects"
          description="Please check your connection and try again."
          action={<Button variant="secondary" onClick={() => refetch()}>Retry</Button>}
        />
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-white shadow-soft p-5 space-y-3"
            >
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={projects.length === 0 ? "No projects yet" : "No matches"}
          description={
            projects.length === 0
              ? "Create your first project to start organizing tasks for your team."
              : "Try clearing filters or adjusting your search."
          }
          action={
            <RoleGate allow={["admin", "manager"]}>
              <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
                New project
              </Button>
            </RoleGate>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <ProjectCard key={p._id} project={p} />
          ))}
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create project"
        description="Set up a new project and invite teammates."
        size="lg"
      >
        <ProjectForm
          submitLabel="Create project"
          onCancel={() => setCreateOpen(false)}
          onSubmit={(values) => createMut.mutateAsync(values)}
        />
      </Modal>
    </div>
  );
}
