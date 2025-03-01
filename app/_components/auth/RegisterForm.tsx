"use client";
import { registerUser } from "@/services/authService";
import { RegisterFormValues, RegisterSchema } from "@/app/lib/zodSchema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

const RegisterForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
    try {
      setLoading(true);
      const response = await registerUser(data);
      if (!response.success) {
        throw new Error("Something went wrong");
      }

      router.push("/login");
    } catch (error) {
      console.error("Error in Login Form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent font-extrabold text-3xl">
              PayFlow
            </span>
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground text-sm">
            Welcome back! Please login to your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            <div>
              <Label htmlFor="username" className="text-gray-700">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                {...register("username")}
                className="mt-1"
              />
              {errors.username && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="mt-1"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-gray-700">
                  Password
                </Label>

                <a href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className="mt-1"
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-gray-700">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                className="mt-1"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded transition-all hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Registering...
                </span>
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col items-center space-y-4">
          <Link href="/login" className="text-sm text-primary hover:underline">
            Already have an account? Login here
          </Link>

          <p className="text-sm text-gray-500 text-center mt-4">
            "Empowering your financial journey with seamless solutions."
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterForm;
