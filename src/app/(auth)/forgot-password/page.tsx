"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KeyRound, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to process request.");
      }

      setMessage(data.message || "Reset link generated.");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-2">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Reset Password
          </h1>
          <p className="text-sm text-slate-400">
            We will generate a secure one-time reset token for your account
          </p>
        </div>

        <Card className="bg-white/95 backdrop-blur-md border-slate-800 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Forgot your credentials?</CardTitle>
            <CardDescription>
              Enter your registered email address to receive recovery steps
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
                {message}
                <p className="text-xs text-emerald-600 mt-1">
                  (In development mode, check your server console log for the reset link)
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button
                type="submit"
                className="w-full mt-2"
                isLoading={isLoading}
              >
                Send Recovery Link
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
