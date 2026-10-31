"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing from the URL.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to reset password.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white/95 backdrop-blur-md border-slate-800 shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Set New Password</CardTitle>
        <CardDescription>
          Enter a strong, secure new password for your account
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
            {error}
          </div>
        )}

        {success ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-semibold text-emerald-900">Password Updated!</h4>
            <p className="text-xs text-emerald-700">
              All active sessions have been invalidated. Redirecting to sign in...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Must be >8 characters with uppercase, lowercase, and special character"
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••••••"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Update Password
            </Button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <Link
            href="/login"
            className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-2">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Choose New Password
          </h1>
          <p className="text-sm text-slate-400">
            Secure your PLANZO subscription credentials
          </p>
        </div>

        <Suspense fallback={<div className="p-8 text-center text-white">Loading form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
