"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Invalid credentials. Please try again.");
      }

      // Route based on role
      if (data.data?.role === "CUSTOMER") {
        router.push("/portal/dashboard");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Brand identity */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-2">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            PLANZO Control Center
          </h1>
          <p className="text-sm text-slate-400">
            Sign in to manage subscriptions, catalog, and billing
          </p>
        </div>

        <Card className="bg-white/95 backdrop-blur-md border-slate-800 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Sign in to your account</CardTitle>
            <CardDescription>
              Enter your corporate email and password to proceed
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                {error}
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

              <div className="space-y-1">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="flex justify-end pt-1">
                  <Link
                    href="/forgot-password"
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                isLoading={isLoading}
              >
                Sign In
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                New customer?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Create business account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo credentials tip for evaluators / team */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 text-center">
          <span className="font-semibold text-indigo-300">Seed Admin Credentials: </span>
          admin@planzo.io / AdminPassword123!
        </div>
      </div>
    </div>
  );
}
