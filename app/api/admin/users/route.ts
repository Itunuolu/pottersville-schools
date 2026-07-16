import { eq, sql } from "drizzle-orm";
import { getDb } from "../../../../db";
import { accessAuditLogs, portalUsers } from "../../../../db/schema";
import { listPortalUsers, requireApiRole, type PortalRole } from "../../../../lib/portal-auth";

const roles: PortalRole[] = ["admin", "teacher", "student"];

export async function GET(request: Request) {
  const admin = await requireApiRole(request, ["admin"]);
  if (admin instanceof Response) return admin;
  return Response.json({ users: await listPortalUsers(), currentUserEmail: admin.email });
}

export async function POST(request: Request) {
  const admin = await requireApiRole(request, ["admin"]);
  if (admin instanceof Response) return admin;

  try {
    const payload = (await request.json()) as { email?: string; displayName?: string; role?: PortalRole; className?: string; users?: { email?: string; displayName?: string; role?: PortalRole; className?: string }[] };
    if (Array.isArray(payload.users)) {
      if (!payload.users.length || payload.users.length > 250) return Response.json({ error: "Import between 1 and 250 accounts at once." }, { status: 400 });
      const normalized = payload.users.map((item, index) => {
        const email = item.email?.trim().toLowerCase() ?? "", displayName = item.displayName?.trim() ?? "", role = item.role;
        if (!/^\S+@\S+\.\S+$/.test(email) || !displayName || !role || !roles.includes(role)) throw new Error(`Row ${index + 2} has an invalid name, email or role.`);
        if (role === "student" && !item.className?.trim()) throw new Error(`Row ${index + 2} needs a class for the student.`);
        return { email, displayName, role, className: role === "student" ? item.className!.trim() : null, createdBy: admin.email };
      });
      const db = getDb();
      await db.insert(portalUsers).values(normalized).onConflictDoNothing();
      await db.insert(accessAuditLogs).values({ actorEmail: admin.email, action: "users.imported", targetEmail: admin.email, detailJson: JSON.stringify({ count: normalized.length }) });
      return Response.json({ imported: normalized.length }, { status: 201 });
    }
    const email = payload.email?.trim().toLowerCase() ?? "";
    const displayName = payload.displayName?.trim() ?? "";
    const role = payload.role;
    const className = payload.className?.trim() || null;

    if (!/^\S+@\S+\.\S+$/.test(email) || !displayName || !role || !roles.includes(role)) {
      return Response.json({ error: "Enter a valid name, email and school role." }, { status: 400 });
    }
    if (role === "student" && !className) {
      return Response.json({ error: "Assign a class to every student account." }, { status: 400 });
    }

    const db = getDb();
    const [user] = await db.insert(portalUsers).values({
      email,
      displayName,
      role,
      className: role === "student" ? className : null,
      createdBy: admin.email,
    }).returning();
    await db.insert(accessAuditLogs).values({
      actorEmail: admin.email,
      action: "user.created",
      targetEmail: email,
      detailJson: JSON.stringify({ role, className }),
    });
    return Response.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Row ")) return Response.json({ error: error.message }, { status: 400 });
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("unique") || message.includes("constraint")) {
      return Response.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    return Response.json({ error: "The account could not be created." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const admin = await requireApiRole(request, ["admin"]);
  if (admin instanceof Response) return admin;

  try {
    const payload = (await request.json()) as { id?: number; role?: PortalRole; status?: "active" | "suspended"; className?: string; displayName?: string };
    const id = Number(payload.id);
    if (!Number.isInteger(id) || id < 1) return Response.json({ error: "Invalid account." }, { status: 400 });

    const db = getDb();
    const [target] = await db.select().from(portalUsers).where(eq(portalUsers.id, id)).limit(1);
    if (!target) return Response.json({ error: "Account not found." }, { status: 404 });
    if (target.email === admin.email && (payload.status === "suspended" || (payload.role && payload.role !== "admin"))) {
      return Response.json({ error: "You cannot remove your own administrator access." }, { status: 400 });
    }

    const role = payload.role && roles.includes(payload.role) ? payload.role : target.role;
    const status = payload.status === "suspended" ? "suspended" : "active";
    const displayName = payload.displayName?.trim() || target.displayName;
    const className = role === "student" ? (payload.className?.trim() || target.className) : null;
    if (role === "student" && !className) return Response.json({ error: "Student accounts require a class." }, { status: 400 });

    const [user] = await db.update(portalUsers).set({ role, status, displayName, className, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(portalUsers.id, id)).returning();
    await db.insert(accessAuditLogs).values({
      actorEmail: admin.email,
      action: "user.updated",
      targetEmail: target.email,
      detailJson: JSON.stringify({ from: { role: target.role, status: target.status, className: target.className }, to: { role, status, className } }),
    });
    return Response.json({ user });
  } catch {
    return Response.json({ error: "The account could not be updated." }, { status: 500 });
  }
}
