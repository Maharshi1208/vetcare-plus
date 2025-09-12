import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { register as apiRegister } from "../services/auth";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Input from "../components/ui/Input";
import PasswordInput from "../components/ui/PasswordInput";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";
import ModalAuthLayout from "../layouts/ModalAuthLayout";

const schema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Minimum 6 characters"),
  confirmPassword: z.string().min(6, "Minimum 6 characters"),
}).refine(v => v.password === v.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});
type FormData = z.infer<typeof schema>;

export default function Register() {
  const { register: fReg, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const { login } = useAuth();
  const nav = useNavigate();

  const onSubmit = async (data: FormData) => {
    try {
      const { confirmPassword, ...payload } = data;
      const resp = await apiRegister(payload);
      const token = (resp as any).token ?? (resp as any).data?.token;
      const user = (resp as any).data?.user;
      if (!token) throw new Error("Token missing in response");
      login(token, user);
      toast.success("Account created!");
      nav("/", { replace: true });
    } catch (e: any) {
      toast.error(e?.message || "Registration failed");
    }
  };

  return (
    <ModalAuthLayout
      title="Create account"
      subtitle="Join VetCare+ to manage your pet clinic workflow."
      altLinkText="I already have an account"
      altLinkTo="/login"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Name"
          placeholder="Your name"
          error={errors.name?.message}
          {...fReg("name")}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...fReg("email")}
        />
        <PasswordInput
          label="Password"
          placeholder="Create a strong password"
          error={errors.password?.message}
          {...fReg("password")}
        />
        <PasswordInput
          label="Confirm Password"
          placeholder="Repeat your password"
          error={errors.confirmPassword?.message}
          {...fReg("confirmPassword")}
        />
        <Button type="submit" fullWidth loading={isSubmitting}>
          Continue
        </Button>
      </form>

      <div className="mt-4 text-center">
        <Link to="#" className="text-sm text-slate-600 dark:text-slate-300 hover:underline">
          Need help?
        </Link>
      </div>
    </ModalAuthLayout>
  );
}
