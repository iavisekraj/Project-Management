import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  FolderKanban,
  CheckSquare,
  AlertTriangle,
  Users as UsersIcon,
  TrendingUp,
  ArrowRight,
  Inbox,
} from "lucide-react";

import PageHeader from "../components/layout/PageHeader.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import Avatar from "../components/ui/Avatar.jsx";
import { StatusPill, PriorityPill } from "../components/ui/StatusBadge.jsx";
import { dashboardApi } from "../api/dashboard.api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { fmtRelative, STATUS_LABEL } from "../utils/format.js";

const STATUS_COLORS_HEX = {
  todo: "#94a3b8",
  in_progress: "#3b82f6",
  review: "#f59e0b",
  done: "#10b981",
};

function StatCard({ label, value, icon: Icon, accent = "brand", trend, hint }) {
  const accents = {
    brand: "from-brand-500 to-brand-700 text-brand-700 bg-brand-50",
    emerald: "from-emerald-500 to-emerald-700 text-emerald-700 bg-emerald-50",
    amber: "from-amber-500 to-amber-700 text-amber-700 bg-amber-50",
    rose: "from-rose-500 to-rose-700 text-rose-700 bg-rose-50",
  };
  const a = accents[accent];
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              {value}
            </p>
            {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
          </div>
          <div
            className={`h-11 w-11 rounded-xl grid place-items-center bg-gradient-to-br ${a.split(" ")[0]} ${a.split(" ")[1]} text-white shadow-soft`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {trend !== undefined && (
          <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
            <TrendingUp className="h-3.5 w-3.5" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-16 mt-3" />
        <Skeleton className="h-3 w-20 mt-3" />
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardApi.stats,
  });

  const pieData = data
    ? Object.entries(data.tasks.byStatus).map(([k, v]) => ({
        name: STATUS_LABEL[k] || k,
        value: v,
        key: k,
      }))
    : [];

  const totalForPie = pieData.reduce((sum, p) => sum + p.value, 0);

  return (
    <div>
      <PageHeader
        title={`Hi, ${user?.name?.split(" ")[0] || "there"}`}
        description="Here's a snapshot of work happening across your projects."
      />

      {isError ? (
        <EmptyState
          icon={AlertTriangle}
          title="Couldn't load dashboard"
          description="Please check your connection or try again."
          action={
            <button
              onClick={() => refetch()}
              className="text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              Retry
            </button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <StatCard
                  label="Active projects"
                  value={data.projects.active}
                  hint={`${data.projects.total} total`}
                  icon={FolderKanban}
                  accent="brand"
                />
                <StatCard
                  label="Open tasks"
                  value={
                    data.tasks.byStatus.todo +
                    data.tasks.byStatus.in_progress +
                    data.tasks.byStatus.review
                  }
                  hint={`${data.tasks.total} total tasks`}
                  icon={CheckSquare}
                  accent="emerald"
                />
                <StatCard
                  label="Overdue"
                  value={data.tasks.overdue}
                  hint="Past due date, not completed"
                  icon={AlertTriangle}
                  accent="rose"
                />
                {hasRole("admin", "manager") ? (
                  <StatCard
                    label="Team members"
                    value={data.users ?? 0}
                    icon={UsersIcon}
                    accent="amber"
                  />
                ) : (
                  <StatCard
                    label="My tasks"
                    value={data.tasks.mine}
                    hint="Assigned to you"
                    icon={UsersIcon}
                    accent="amber"
                  />
                )}
              </>
            )}
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div>
                  <CardTitle>Completion trend</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">
                    Tasks completed in the last 7 days
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : data.completionTrend.every((d) => d.completed === 0) ? (
                  <EmptyState
                    icon={TrendingUp}
                    title="No completed tasks yet"
                    description="Mark tasks as Done to see your team's velocity here."
                    className="border-0 bg-transparent py-8"
                  />
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.completionTrend}>
                        <defs>
                          <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(v) => v.slice(5)}
                          tick={{ fill: "#64748b", fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fill: "#64748b", fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                          width={28}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 8,
                            border: "1px solid #e2e8f0",
                            fontSize: 12,
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="completed"
                          stroke="#6366f1"
                          strokeWidth={2.5}
                          fill="url(#fillCompleted)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Tasks by status</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">Distribution snapshot</p>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : totalForPie === 0 ? (
                  <EmptyState
                    icon={Inbox}
                    title="No tasks yet"
                    description="Create your first task to see the distribution."
                    className="border-0 bg-transparent py-8"
                  />
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          stroke="none"
                        >
                          {pieData.map((entry) => (
                            <Cell
                              key={entry.key}
                              fill={STATUS_COLORS_HEX[entry.key] || "#94a3b8"}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: 8,
                            border: "1px solid #e2e8f0",
                            fontSize: 12,
                          }}
                        />
                        <Legend
                          iconType="circle"
                          formatter={(v) => <span className="text-xs text-slate-600">{v}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <div>
                <CardTitle>Recent activity</CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  Latest task updates across your projects
                </p>
              </div>
              <Link
                to="/tasks"
                className="text-sm font-medium text-brand-700 hover:text-brand-800 inline-flex items-center gap-1"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-5 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : data.recentTasks.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title="Nothing here yet"
                  description="Tasks you create will appear in this feed."
                  className="border-0 bg-transparent"
                />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {data.recentTasks.map((t) => (
                    <li
                      key={t._id}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition"
                    >
                      <span
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{ background: t.project?.color || "#6366f1" }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {t.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {t.project?.name} · updated {fmtRelative(t.updatedAt)}
                        </p>
                      </div>
                      <PriorityPill priority={t.priority} />
                      <StatusPill status={t.status} />
                      {t.assignee ? (
                        <Avatar name={t.assignee.name} src={t.assignee.avatarUrl} size="sm" />
                      ) : (
                        <div className="h-8 w-8 rounded-full border border-dashed border-slate-300" />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
