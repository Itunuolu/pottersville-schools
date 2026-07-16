import { asc, count, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getChatGPTUser } from "../app/chatgpt-auth";
import { getDb } from "../db";
import { portalUsers } from "../db/schema";

export type PortalRole = "admin" | "teacher" | "student";

export type PortalUser = {
  id: number;
  email: string;
  displayName: string;
  role: PortalRole;
  status: "active" | "suspended";
  className: string | null;
};

function homeForRole(role: PortalRole) {
  if (role === "admin") return "/admin";
  if (role === "teacher") return "/teacher";
  return "/student";
}

export async function resolvePortalUser(options: { bootstrapFirstAdmin?: boolean } = {}): Promise<PortalUser | null> {
  const identity = await getChatGPTUser();
  if (!identity) return null;

  const db = getDb();
  const email = identity.email.trim().toLowerCase();
  const [existing] = await db
    .select({
      id: portalUsers.id,
      email: portalUsers.email,
      displayName: portalUsers.displayName,
      role: portalUsers.role,
      status: portalUsers.status,
      className: portalUsers.className,
    })
    .from(portalUsers)
    .where(eq(portalUsers.email, email))
    .limit(1);

  if (existing) return existing;
  if (!options.bootstrapFirstAdmin) return null;

  const [{ value: userCount }] = await db.select({ value: count() }).from(portalUsers);
  if (userCount > 0) return null;

  const [admin] = await db
    .insert(portalUsers)
    .values({
      email,
      displayName: identity.fullName?.trim() || identity.displayName || email,
      role: "admin",
      createdBy: "system:first-admin",
    })
    .returning({
      id: portalUsers.id,
      email: portalUsers.email,
      displayName: portalUsers.displayName,
      role: portalUsers.role,
      status: portalUsers.status,
      className: portalUsers.className,
    });
  return admin;
}

export async function requirePortalRole(returnTo: string, allowedRoles: PortalRole[]): Promise<PortalUser> {
  const identity = await getChatGPTUser();
  if (!identity) redirect(`/login?return_to=${encodeURIComponent(returnTo)}`);

  const user = await resolvePortalUser({ bootstrapFirstAdmin: true });
  if (!user) redirect("/access-pending");
  if (user.status !== "active") redirect("/access-pending?suspended=1");
  if (!allowedRoles.includes(user.role)) redirect(homeForRole(user.role));
  return user;
}

export async function redirectToPortalHome() {
  const user = await resolvePortalUser({ bootstrapFirstAdmin: true });
  if (!user) redirect("/access-pending");
  if (user.status !== "active") redirect("/access-pending?suspended=1");
  redirect(homeForRole(user.role));
}

export async function requireApiRole(request: Request, allowedRoles: PortalRole[]): Promise<PortalUser | Response> {
  const email = request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase();
  if (!email) return Response.json({ error: "Please sign in to continue." }, { status: 401 });

  try {
    const [user] = await getDb()
      .select({
        id: portalUsers.id,
        email: portalUsers.email,
        displayName: portalUsers.displayName,
        role: portalUsers.role,
        status: portalUsers.status,
        className: portalUsers.className,
      })
      .from(portalUsers)
      .where(eq(portalUsers.email, email))
      .limit(1);

    if (!user) return Response.json({ error: "Your school account has not been activated." }, { status: 403 });
    if (user.status !== "active") return Response.json({ error: "Your school account is suspended." }, { status: 403 });
    if (!allowedRoles.includes(user.role)) return Response.json({ error: "You do not have permission to perform this action." }, { status: 403 });
    return user;
  } catch {
    return Response.json({ error: "Account access is temporarily unavailable." }, { status: 503 });
  }
}

export async function listPortalUsers() {
  return getDb()
    .select({
      id: portalUsers.id,
      email: portalUsers.email,
      displayName: portalUsers.displayName,
      role: portalUsers.role,
      status: portalUsers.status,
      className: portalUsers.className,
      createdAt: portalUsers.createdAt,
    })
    .from(portalUsers)
    .orderBy(asc(portalUsers.role), asc(portalUsers.displayName));
}
