import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { InternalShell } from "@/components/layout/InternalShell";
import { UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // If a customer accesses internal management, redirect them to their portal
  if (user.role === UserRole.CUSTOMER) {
    redirect("/portal/dashboard");
  }

  return <InternalShell user={user}>{children}</InternalShell>;
}
