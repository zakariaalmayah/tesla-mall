import "server-only";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

export interface AdminSession {
  id: string;
  name: string;
  role: string;
}

/**
 * Guards every /admin route. Deliberately uses notFound() rather than a
 * redirect to /login — the dashboard's existence shouldn't be discoverable
 * to non-admin users.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await auth();
  if (!session?.user?.id || !ADMIN_ROLES.has(session.user.role)) {
    notFound();
  }
  return {
    id: session.user.id,
    name: session.user.name ?? "",
    role: session.user.role,
  };
}
