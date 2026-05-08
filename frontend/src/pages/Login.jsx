import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import { getApiError } from "../api/client.js";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password is required"),
});

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPwd, setShowPwd] = useState(false);
  const from = location.state?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  if (isAuthenticated) return <Navigate to={from} replace />;

  const onSubmit = async (values) => {
    try {
      await login(values.email, values.password);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      const msg = getApiError(err, "Login failed");
      setError("password", { message: msg });
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex relative bg-gradient-to-br from-brand-600 via-brand-700 to-violet-700 text-white p-12 flex-col justify-between overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 -left-32 w-96 h-96 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-white/15 grid place-items-center backdrop-blur">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">Pulse</span>
          </div>
        </div>
        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold leading-tight">
            Bring clarity to every project, one task at a time.
          </h2>
          <p className="mt-4 text-brand-100 leading-relaxed">
            Pulse helps your team plan work, assign owners, and ship faster — with a
            clean kanban, real-time priorities, and dashboards everyone trusts.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              "Role-based access for admins, managers, members",
              "Kanban board with drag-friendly status updates",
              "Live dashboards with completion trends",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2 text-brand-50">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative text-xs text-brand-100/80">
          © {new Date().getFullYear()} Pulse PM
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Pulse
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sign in to your account
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back. Please enter your details.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Password"
              type={showPwd ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="pointer-events-auto p-1 rounded hover:bg-slate-100"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              error={errors.password?.message}
              {...register("password")}
            />
            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-sm text-center text-slate-600">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-800">
              Create one
            </Link>
          </p>

          <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-3 text-xs text-slate-500">
            <p className="font-semibold text-slate-700">Demo accounts</p>
            <p className="mt-1">admin@pm.app / admin123</p>
            <p>manager@pm.app / manager123</p>
            <p>dev@pm.app / dev12345</p>
          </div>
        </div>
      </div>
    </div>
  );
}
