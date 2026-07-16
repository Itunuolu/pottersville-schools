import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { assignmentSubmissions, assignments, portalUsers, schoolClasses, subjects, teacherAssignments } from "../../../db/schema";
import { requireApiRole } from "../../../lib/portal-auth";
import { numberInRange } from "../../../lib/school-utils";

export async function GET(request: Request) {
  const user = await requireApiRole(request, ["admin", "teacher", "student"]);
  if (user instanceof Response) return user;
  const db = getDb();
  const url = new URL(request.url);
  const classId = Number(url.searchParams.get("classId"));
  const conditions = [];
  if (classId) conditions.push(eq(assignments.classId, classId));
  if (user.role === "student") {
    const [classRow] = await db.select({ id: schoolClasses.id }).from(schoolClasses).where(eq(schoolClasses.name, user.className || "__unassigned__")).limit(1);
    conditions.push(eq(assignments.classId, classRow?.id || -1), eq(assignments.status, "published"));
  }
  if (user.role === "teacher") conditions.push(eq(assignments.teacherEmail, user.email));
  const rows = await db.select({ id: assignments.id, title: assignments.title, description: assignments.description, subjectId: assignments.subjectId, subjectName: subjects.name, classId: assignments.classId, className: schoolClasses.name, teacherEmail: assignments.teacherEmail, dueAt: assignments.dueAt, maxScore: assignments.maxScore, status: assignments.status, createdAt: assignments.createdAt }).from(assignments).leftJoin(subjects, eq(assignments.subjectId, subjects.id)).leftJoin(schoolClasses, eq(assignments.classId, schoolClasses.id)).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(assignments.dueAt));
  const assignmentIds = rows.map((row) => row.id);
  const submissions = assignmentIds.length ? await db.select({ id: assignmentSubmissions.id, assignmentId: assignmentSubmissions.assignmentId, studentEmail: assignmentSubmissions.studentEmail, studentName: portalUsers.displayName, content: assignmentSubmissions.content, score: assignmentSubmissions.score, feedback: assignmentSubmissions.feedback, status: assignmentSubmissions.status, submittedAt: assignmentSubmissions.submittedAt }).from(assignmentSubmissions).leftJoin(portalUsers, eq(assignmentSubmissions.studentEmail, portalUsers.email)).where(and(inArray(assignmentSubmissions.assignmentId, assignmentIds), user.role === "student" ? eq(assignmentSubmissions.studentEmail, user.email) : undefined)).orderBy(desc(assignmentSubmissions.submittedAt)) : [];
  return Response.json({ assignments: rows, submissions });
}

export async function POST(request: Request) {
  const user = await requireApiRole(request, ["admin", "teacher", "student"]);
  if (user instanceof Response) return user;
  try {
    const payload = (await request.json()) as { action?: string; title?: string; description?: string; subjectId?: number; classId?: number; dueAt?: string; maxScore?: number; status?: "draft" | "published" | "closed"; assignmentId?: number; content?: string; score?: number; feedback?: string; studentEmail?: string };
    const action = String(payload.action || "assignment.create");
    const db = getDb();
    if (action === "assignment.create") {
      if (user.role === "student") return Response.json({ error: "Only teachers can create assignments." }, { status: 403 });
      const title = String(payload.title || "").trim(), description = String(payload.description || "").trim(), subjectId = Number(payload.subjectId), classId = Number(payload.classId), dueAt = String(payload.dueAt || "");
      if (!title || !description || !subjectId || !classId || !dueAt) return Response.json({ error: "Complete all assignment details." }, { status: 400 });
      if (user.role === "teacher") {
        const [assigned] = await db.select().from(teacherAssignments).where(and(eq(teacherAssignments.teacherEmail, user.email), eq(teacherAssignments.subjectId, subjectId), eq(teacherAssignments.classId, classId))).limit(1);
        if (!assigned) return Response.json({ error: "This class and subject are not assigned to you." }, { status: 403 });
      }
      const [assignment] = await db.insert(assignments).values({ title, description, subjectId, classId, teacherEmail: user.email, dueAt, maxScore: Math.round(numberInRange(payload.maxScore, 1, 100, 10)), status: payload.status || "published" }).returning();
      return Response.json({ assignment }, { status: 201 });
    }
    if (action === "submission.create") {
      if (user.role !== "student") return Response.json({ error: "Only student accounts can submit assignments." }, { status: 403 });
      const assignmentId = Number(payload.assignmentId), content = String(payload.content || "").trim();
      if (!assignmentId || !content) return Response.json({ error: "Write or paste your assignment response." }, { status: 400 });
      const [assignment] = await db.select().from(assignments).innerJoin(schoolClasses, eq(assignments.classId, schoolClasses.id)).where(and(eq(assignments.id, assignmentId), eq(schoolClasses.name, user.className || "__unassigned__"), eq(assignments.status, "published"))).limit(1);
      if (!assignment) return Response.json({ error: "This assignment is not available to your class." }, { status: 403 });
      const value = { assignmentId, studentEmail: user.email, content, status: "submitted" as const, submittedAt: new Date().toISOString(), score: null, feedback: "", gradedAt: null };
      await db.insert(assignmentSubmissions).values(value).onConflictDoUpdate({ target: [assignmentSubmissions.assignmentId, assignmentSubmissions.studentEmail], set: value });
      return Response.json({ submitted: true }, { status: 201 });
    }
    if (action === "submission.grade") {
      if (user.role === "student") return Response.json({ error: "Only teachers can grade assignments." }, { status: 403 });
      const assignmentId = Number(payload.assignmentId), studentEmail = String(payload.studentEmail || "").toLowerCase();
      const [assignment] = await db.select().from(assignments).where(eq(assignments.id, assignmentId)).limit(1);
      if (!assignment || (user.role === "teacher" && assignment.teacherEmail !== user.email)) return Response.json({ error: "You cannot grade this assignment." }, { status: 403 });
      const score = numberInRange(payload.score, 0, assignment.maxScore, 0);
      await db.update(assignmentSubmissions).set({ score, feedback: String(payload.feedback || ""), status: "graded", gradedAt: sql`CURRENT_TIMESTAMP` }).where(and(eq(assignmentSubmissions.assignmentId, assignmentId), eq(assignmentSubmissions.studentEmail, studentEmail)));
      return Response.json({ graded: true, score });
    }
    return Response.json({ error: "Unsupported assignment action." }, { status: 400 });
  } catch {
    return Response.json({ error: "Assignment action could not be completed." }, { status: 500 });
  }
}
