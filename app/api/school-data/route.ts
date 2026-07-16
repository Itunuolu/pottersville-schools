import { asc, eq, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import {
  academicSessions,
  academicTerms,
  accessAuditLogs,
  announcements,
  portalUsers,
  schoolClasses,
  schoolEvents,
  subjects,
  teacherAssignments,
  timetableEntries,
} from "../../../db/schema";
import { requireApiRole } from "../../../lib/portal-auth";

export async function GET(request: Request) {
  const user = await requireApiRole(request, ["admin", "teacher", "student"]);
  if (user instanceof Response) return user;

  const db = getDb();
  const [sessions, terms, classes, subjectRows, assignments, timetable, people] = await Promise.all([
    db.select().from(academicSessions).orderBy(asc(academicSessions.startDate)),
    db.select().from(academicTerms).orderBy(asc(academicTerms.startDate)),
    db.select().from(schoolClasses).orderBy(asc(schoolClasses.name)),
    db.select().from(subjects).orderBy(asc(subjects.name)),
    db.select().from(teacherAssignments),
    db.select().from(timetableEntries).orderBy(asc(timetableEntries.dayOfWeek), asc(timetableEntries.startTime)),
    db.select({ id: portalUsers.id, email: portalUsers.email, displayName: portalUsers.displayName, role: portalUsers.role, className: portalUsers.className, status: portalUsers.status }).from(portalUsers).orderBy(asc(portalUsers.displayName)),
  ]);

  const visiblePeople = user.role === "student" ? people.filter((person) => person.email === user.email) : people;
  return Response.json({ sessions, terms, classes, subjects: subjectRows, teacherAssignments: assignments, timetable, people: visiblePeople, currentUser: user });
}

export async function POST(request: Request) {
  const admin = await requireApiRole(request, ["admin"]);
  if (admin instanceof Response) return admin;

  try {
    const payload = (await request.json()) as Record<string, unknown> & { action?: string };
    const action = String(payload.action || "");
    const db = getDb();
    let result: unknown;

    if (action === "session.create") {
      const name = String(payload.name || "").trim();
      const startDate = String(payload.startDate || "");
      const endDate = String(payload.endDate || "");
      if (!name || !startDate || !endDate) return Response.json({ error: "Session name and dates are required." }, { status: 400 });
      if (payload.isCurrent) await db.update(academicSessions).set({ isCurrent: false });
      [result] = await db.insert(academicSessions).values({ name, startDate, endDate, isCurrent: Boolean(payload.isCurrent) }).returning();
    } else if (action === "term.create") {
      const sessionId = Number(payload.sessionId);
      const name = String(payload.name || "").trim();
      const startDate = String(payload.startDate || "");
      const endDate = String(payload.endDate || "");
      if (!sessionId || !name || !startDate || !endDate) return Response.json({ error: "Term, session and dates are required." }, { status: 400 });
      if (payload.isCurrent) await db.update(academicTerms).set({ isCurrent: false });
      [result] = await db.insert(academicTerms).values({ sessionId, name, startDate, endDate, isCurrent: Boolean(payload.isCurrent) }).returning();
    } else if (action === "class.create") {
      const name = String(payload.name || "").trim();
      const level = String(payload.level || "").trim();
      if (!name || !level) return Response.json({ error: "Class name and level are required." }, { status: 400 });
      [result] = await db.insert(schoolClasses).values({ name, level, arm: String(payload.arm || "").trim(), formTeacherEmail: String(payload.formTeacherEmail || "").trim() || null, capacity: Number(payload.capacity) || 35 }).returning();
    } else if (action === "subject.create") {
      const name = String(payload.name || "").trim();
      const code = String(payload.code || "").trim().toUpperCase();
      if (!name || !code) return Response.json({ error: "Subject name and code are required." }, { status: 400 });
      [result] = await db.insert(subjects).values({ name, code, department: String(payload.department || "General").trim() }).returning();
    } else if (action === "teacher.assign") {
      const teacherEmail = String(payload.teacherEmail || "").trim().toLowerCase();
      const subjectId = Number(payload.subjectId);
      const classId = Number(payload.classId);
      if (!teacherEmail || !subjectId || !classId) return Response.json({ error: "Teacher, subject and class are required." }, { status: 400 });
      [result] = await db.insert(teacherAssignments).values({ teacherEmail, subjectId, classId }).returning();
    } else if (action === "timetable.create") {
      const teacherEmail = String(payload.teacherEmail || "").trim().toLowerCase();
      const subjectId = Number(payload.subjectId);
      const classId = Number(payload.classId);
      const dayOfWeek = Number(payload.dayOfWeek);
      if (!teacherEmail || !subjectId || !classId || dayOfWeek < 1 || dayOfWeek > 5) return Response.json({ error: "Complete the timetable details." }, { status: 400 });
      [result] = await db.insert(timetableEntries).values({ classId, subjectId, teacherEmail, dayOfWeek, startTime: String(payload.startTime || "08:00"), endTime: String(payload.endTime || "08:45"), room: String(payload.room || "Classroom") }).returning();
    } else if (action === "student.enrol") {
      const email = String(payload.email || "").trim().toLowerCase();
      const className = String(payload.className || "").trim();
      if (!email || !className) return Response.json({ error: "Student and class are required." }, { status: 400 });
      [result] = await db.update(portalUsers).set({ className, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(portalUsers.email, email)).returning();
    } else if (action === "demo.seed") {
      result = await seedDemo(admin.email);
    } else {
      return Response.json({ error: "Unsupported academic action." }, { status: 400 });
    }

    await db.insert(accessAuditLogs).values({ actorEmail: admin.email, action, targetEmail: admin.email, detailJson: JSON.stringify(payload) });
    return Response.json({ result }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("unique") || message.includes("constraint")) return Response.json({ error: "That record already exists." }, { status: 409 });
    return Response.json({ error: "The academic record could not be saved." }, { status: 500 });
  }
}

async function seedDemo(adminEmail: string) {
  const db = getDb();
  const existingClasses = await db.select().from(schoolClasses).limit(1);
  if (existingClasses.length) return { seeded: false, message: "Demo structure already exists." };

  const [session] = await db.insert(academicSessions).values({ name: "2026/2027", startDate: "2026-09-07", endDate: "2027-07-23", isCurrent: true }).returning();
  const [term] = await db.insert(academicTerms).values({ sessionId: session.id, name: "First Term", startDate: "2026-09-07", endDate: "2026-12-18", isCurrent: true }).returning();
  const classRows = await db.insert(schoolClasses).values([
    { name: "JSS 2A", level: "JSS 2", arm: "A", capacity: 32 },
    { name: "JSS 3A", level: "JSS 3", arm: "A", capacity: 30 },
    { name: "SS 1B", level: "SS 1", arm: "B", capacity: 28 },
  ]).returning();
  const subjectRows = await db.insert(subjects).values([
    { name: "Basic Science", code: "BSC", department: "Science" },
    { name: "Biology", code: "BIO", department: "Science" },
    { name: "Agricultural Science", code: "AGR", department: "Science" },
    { name: "Mathematics", code: "MAT", department: "Science" },
    { name: "English Language", code: "ENG", department: "Languages" },
  ]).returning();
  const teacherEmail = "faith.teacher@purplestars.demo";
  const demoStudents = Array.from({ length: 12 }, (_, index) => ({
    email: `student${index + 1}@purplestars.demo`,
    displayName: ["Amara Okafor", "David Bello", "Chiamaka Eze", "Tobi Williams", "Zainab Musa", "Favour James", "Daniel Adeyemi", "Ada Nwosu", "Micheal Peters", "Grace Johnson", "Samuel Udo", "Aisha Lawal"][index],
    role: "student" as const,
    className: "SS 1B",
    createdBy: adminEmail,
  }));
  await db.insert(portalUsers).values([{ email: teacherEmail, displayName: "Akinkugbe Faith", role: "teacher", createdBy: adminEmail }, ...demoStudents]).onConflictDoNothing();
  await db.insert(teacherAssignments).values([
    { teacherEmail, subjectId: subjectRows[0].id, classId: classRows[0].id },
    { teacherEmail, subjectId: subjectRows[1].id, classId: classRows[2].id },
    { teacherEmail, subjectId: subjectRows[2].id, classId: classRows[1].id },
  ]).onConflictDoNothing();
  await db.insert(timetableEntries).values([
    { classId: classRows[0].id, subjectId: subjectRows[0].id, teacherEmail, dayOfWeek: 4, startTime: "08:15", endTime: "09:00", room: "Science Lab" },
    { classId: classRows[2].id, subjectId: subjectRows[1].id, teacherEmail, dayOfWeek: 4, startTime: "10:30", endTime: "11:15", room: "Room 12" },
    { classId: classRows[1].id, subjectId: subjectRows[2].id, teacherEmail, dayOfWeek: 4, startTime: "13:20", endTime: "14:05", room: "School Farm" },
  ]);
  await db.insert(announcements).values({ title: "Welcome to the new PurpleStars portal", body: "Explore the connected learning, attendance and assessment tools prepared for our school community.", audience: "all", priority: "important", publishedBy: adminEmail });
  await db.insert(schoolEvents).values({ title: "Inter-house Sports Day", description: "Annual sports day for all houses.", startAt: "2026-07-24T10:00:00Z", endAt: "2026-07-24T16:00:00Z", location: "Main field", audience: "all", createdBy: adminEmail });
  return { seeded: true, session: session.name, term: term.name, classes: classRows.length, subjects: subjectRows.length, students: demoStudents.length };
}
