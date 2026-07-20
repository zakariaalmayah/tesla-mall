import "server-only";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";

import { redirect } from "@/i18n/routing";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

export interface AdminSession {
  id: string;
  name: string;
  role: string;
}

/**
 * Guards every /admin route. Redirects to /login if the user is not logged in.
 * If the user is logged in but is not an admin, it uses notFound() so the
 * dashboard's existence isn't discoverable to non-admin users.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login" as never);
    throw new Error("UNAUTHENTICATED");
  }
  if (!ADMIN_ROLES.has(session.user.role)) {
    notFound();
  }
  return {
    id: session.user.id,
    name: session.user.name ?? "",
    role: session.user.role,
  };
}
