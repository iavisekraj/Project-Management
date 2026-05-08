import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import PageHeader from "../components/layout/PageHeader.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import Avatar from "../components/ui/Avatar.jsx";
import { RolePill } from "../components/ui/StatusBadge.jsx";

import { authApi } from "../api/auth.api.js";
import { getApiError } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  title: z.string().max(80).optional().or(z.literal("")),
  avatarUrl: z.string().url("Must be a valid URL").max(500).optional().or(z.literal("")),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export default function Profile() {
  const { user, setUser } = useAuth();

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      title: user?.title || "",
      avatarUrl: user?.avatarUrl || "",
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const updateMut = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: ({ user: u }) => {
      toast.success("Profile updated");
      setUser(u);
    },
    onError: (err) => toast.error(getApiError(err)),
  });

  const passwordMut = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      toast.success("Password updated");
      passwordForm.reset();
    },
    onError: (err) => toast.error(getApiError(err)),
  });

  const watchedAvatar = profileForm.watch("avatarUrl");
  const watchedName = profileForm.watch("name");

  return (
    <div>
      <PageHeader
        title="Profile"
        description="Manage your personal information and password."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Avatar name={watchedName || user?.name} src={watchedAvatar || user?.avatarUrl} size="lg" className="h-20 w-20 text-2xl" />
            <h2 className="mt-4 text-lg font-semibold text-slate-900">{user?.name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <div className="mt-3">
              <RolePill role={user?.role} />
            </div>
            {user?.title && (
              <p className="mt-3 text-xs text-slate-500 italic">{user.title}</p>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account details</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={profileForm.handleSubmit((v) => updateMut.mutateAsync(v))}
                className="space-y-4"
                noValidate
              >
                <Input
                  label="Full name"
                  error={profileForm.formState.errors.name?.message}
                  {...profileForm.register("name")}
                />
                <Input
                  label="Title"
                  placeholder="e.g. Senior Engineer"
                  error={profileForm.formState.errors.title?.message}
                  {...profileForm.register("title")}
                />
                <Input
                  label="Avatar URL"
                  placeholder="https://…"
                  error={profileForm.formState.errors.avatarUrl?.message}
                  {...profileForm.register("avatarUrl")}
                />
                <div className="flex items-center justify-end pt-2">
                  <Button type="submit" loading={profileForm.formState.isSubmitting || updateMut.isPending}>
                    Save changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change password</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={passwordForm.handleSubmit((v) =>
                  passwordMut.mutateAsync({
                    currentPassword: v.currentPassword,
                    newPassword: v.newPassword,
                  })
                )}
                className="space-y-4"
                noValidate
              >
                <Input
                  label="Current password"
                  type="password"
                  autoComplete="current-password"
                  error={passwordForm.formState.errors.currentPassword?.message}
                  {...passwordForm.register("currentPassword")}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="New password"
                    type="password"
                    autoComplete="new-password"
                    error={passwordForm.formState.errors.newPassword?.message}
                    {...passwordForm.register("newPassword")}
                  />
                  <Input
                    label="Confirm new password"
                    type="password"
                    autoComplete="new-password"
                    error={passwordForm.formState.errors.confirmPassword?.message}
                    {...passwordForm.register("confirmPassword")}
                  />
                </div>
                <div className="flex items-center justify-end pt-2">
                  <Button type="submit" loading={passwordMut.isPending}>
                    Update password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
