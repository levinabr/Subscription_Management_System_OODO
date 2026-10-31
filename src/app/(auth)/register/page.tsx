"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Building2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    email: "",
    password: "",
    phone: "",
    taxIdentifier: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Registration failed.");
      }

      router.push("/portal/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-slate-100 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-2">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Brightloop Customer Registration
          </h1>
          <p className="text-sm text-slate-400">
            Set up your organization account for automated subscription billing
          </p>
        </div>

        <Card className="bg-white/95 backdrop-blur-md border-slate-800 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Register Organization</CardTitle>
            <CardDescription>
              All customer accounts gain instant access to the self-service portal
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  name="companyName"
                  placeholder="Acme Corp"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                />
                <Input
                  label="Primary Contact Name"
                  name="name"
                  placeholder="Jane Doe"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <Input
                label="Corporate Email Address"
                name="email"
                type="email"
                placeholder="contact@acme.com"
                required
                value={formData.email}
                onChange={handleChange}
              />

              <div className="space-y-1.5">
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="••••••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  helperText="Must be >8 characters with uppercase, lowercase, and special character"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <Input
                  label="Tax ID / GSTIN (Optional)"
                  name="taxIdentifier"
                  placeholder="22AAAAA0000A1Z5"
                  value={formData.taxIdentifier}
                  onChange={handleChange}
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-4"
                isLoading={isLoading}
              >
                Complete Registration & Launch Portal
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Already registered?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
