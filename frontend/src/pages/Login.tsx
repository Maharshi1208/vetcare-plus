import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { login as apiLogin } from "../services/auth";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Input from "../components/ui/Input";
import PasswordInput from "../components/ui/PasswordInput";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";
import CenteredAuthLayout from "../layouts/CenteredAuthLayout";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as any;
  const from = loc?.state?.from?.pathname ?? "/";

  const onSubmit = async (data: FormData) => {
    try {
      const resp = await apiLogin(data);
      const token = (resp as any).token ?? (resp as any).data?.token;
      const user = (resp as any).data?.user;
      if (!token) throw new Error("Token missing in response");
      login(token, user);
      toast.success("Welcome back!");
      nav(from, { replace: true });
    } catch (e: any) {
      toast.error(e?.message || "Login failed");
    }
  };

  return (
    <CenteredAuthLayout
      title="Sign in"
      subtitle="Access your VetCare+ dashboard."
      footer={
        <p className="text-sm mt-6 text-center text-slate-600 dark:text-slate-300">
          No account?{" "}
          <Link to="/register" className="underline text-emerald-700 dark:text-emerald-400 hover:opacity-90">
            Create one
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordInput
          label="Password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" fullWidth loading={isSubmitting}>
          Sign In
        </Button>
      </form>
    </CenteredAuthLayout>
  );
}
