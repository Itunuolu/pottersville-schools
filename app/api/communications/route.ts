import { and, desc, eq, or } from "drizzle-orm";
import { getDb } from "../../../db";
import { announcements, schoolClasses, schoolEvents, supportTickets } from "../../../db/schema";
import { requireApiRole } from "../../../lib/portal-auth";

export async function GET(request: Request) {
  const user = await requireApiRole(request, ["admin", "teacher", "student"]);
  if (user instanceof Response) return user;
  const db = getDb();
  const [classRow] = user.className ? await db.select({ id: schoolClasses.id }).from(schoolClasses).where(eq(schoolClasses.name, user.className)).limit(1) : [];
  const roleAudience = user.role === "student" ? "students" : user.role === "teacher" ? "teachers" : "all";
  const announcementRows = await db.select().from(announcements).where(user.role === "admin" ? undefined : or(eq(announcements.audience, "all"), eq(announcements.audience, roleAudience), classRow ? and(eq(announcements.audience, "class"), eq(announcements.classId, classRow.id)) : undefined)).orderBy(desc(announcements.publishedAt)).limit(40);
  const eventRows = await db.select().from(schoolEvents).where(user.role === "admin" ? undefined : or(eq(schoolEvents.audience, "all"), eq(schoolEvents.audience, roleAudience))).orderBy(desc(schoolEvents.startAt)).limit(40);
  const ticketRows = await db.select().from(supportTickets).where(user.role === "admin" ? undefined : eq(supportTickets.createdBy, user.email)).orderBy(desc(supportTickets.createdAt)).limit(50);
  return Response.json({ announcements: announcementRows, events: eventRows, tickets: ticketRows });
}

export async function POST(request: Request) {
  const user = await requireApiRole(request, ["admin", "teacher", "student"]);
  if (user instanceof Response) return user;
  try {
    const payload = (await request.json()) as Record<string, unknown> & { action?: string };
    const action = String(payload.action || "ticket.create");
    const db = getDb();
    if (action === "announcement.create") {
      if (user.role === "student") return Response.json({ error: "Only staff can publish announcements." }, { status: 403 });
      const title = String(payload.title || "").trim(), body = String(payload.body || "").trim();
      if (!title || !body) return Response.json({ error: "Announcement title and message are required." }, { status: 400 });
      const audience = user.role === "teacher" ? (payload.audience === "class" ? "class" : "students") : ["all", "teachers", "students", "class"].includes(String(payload.audience)) ? String(payload.audience) as "all" | "teachers" | "students" | "class" : "all";
      const [item] = await db.insert(announcements).values({ title, body, audience, classId: Number(payload.classId) || null, priority: ["normal", "important", "urgent"].includes(String(payload.priority)) ? String(payload.priority) as "normal" | "important" | "urgent" : "normal", publishedBy: user.email }).returning();
      return Response.json({ announcement: item }, { status: 201 });
    }
    if (action === "event.create") {
      if (user.role !== "admin") return Response.json({ error: "Only administrators can create school events." }, { status: 403 });
      const title = String(payload.title || "").trim(), startAt = String(payload.startAt || ""), endAt = String(payload.endAt || "");
      if (!title || !startAt || !endAt) return Response.json({ error: "Event title and dates are required." }, { status: 400 });
      const [event] = await db.insert(schoolEvents).values({ title, description: String(payload.description || ""), startAt, endAt, location: String(payload.location || "School campus"), audience: ["all", "teachers", "students"].includes(String(payload.audience)) ? String(payload.audience) as "all" | "teachers" | "students" : "all", createdBy: user.email }).returning();
      return Response.json({ event }, { status: 201 });
    }
    if (action === "ticket.create") {
      const subject = String(payload.subject || "").trim(), message = String(payload.message || "").trim();
      if (!subject || !message) return Response.json({ error: "Ticket subject and message are required." }, { status: 400 });
      const [ticket] = await db.insert(supportTickets).values({ subject, message, category: String(payload.category || "General"), priority: ["low", "normal", "high"].includes(String(payload.priority)) ? String(payload.priority) as "low" | "normal" | "high" : "normal", createdBy: user.email }).returning();
      return Response.json({ ticket }, { status: 201 });
    }
    if (action === "ticket.update") {
      if (user.role !== "admin") return Response.json({ error: "Only administrators can update tickets." }, { status: 403 });
      const id = Number(payload.id), status = ["open", "in_progress", "resolved"].includes(String(payload.status)) ? String(payload.status) as "open" | "in_progress" | "resolved" : "open";
      await db.update(supportTickets).set({ status, assignedTo: String(payload.assignedTo || user.email), updatedAt: new Date().toISOString() }).where(eq(supportTickets.id, id));
      return Response.json({ updated: true });
    }
    return Response.json({ error: "Unsupported communication action." }, { status: 400 });
  } catch {
    return Response.json({ error: "The communication could not be saved." }, { status: 500 });
  }
}
