import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Mail, Lock, User, Eye, EyeOff, Sparkles } from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import { getApiError } from "../api/client.js";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(80),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters").max(64),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

export default function Register() {
  const { isAuthenticated, register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirm: "" },
  });

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (values) => {
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      toast.success("Account created. Welcome!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = getApiError(err, "Registration failed");
      setError("email", { message: msg });
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-white to-brand-50">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">Pulse</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-card p-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Start managing your projects in seconds. The first user becomes admin.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <Input
              label="Full name"
              placeholder="Jane Doe"
              leftIcon={<User className="h-4 w-4" />}
              error={errors.name?.message}
              autoComplete="name"
              {...register("name")}
            />
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
              autoComplete="new-password"
              placeholder="At least 6 characters"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="pointer-events-auto p-1 rounded hover:bg-slate-100"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              error={errors.password?.message}
              {...register("password")}
            />
            <Input
              label="Confirm password"
              type={showPwd ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.confirm?.message}
              {...register("confirm")}
            />
            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              Create account
            </Button>
          </form>

          <p className="mt-6 text-sm text-center text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
