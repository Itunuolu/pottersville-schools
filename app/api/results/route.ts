import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { academicTerms, portalUsers, reportCards, resultRecords, schoolClasses, subjects, teacherAssignments } from "../../../db/schema";
import { requireApiRole } from "../../../lib/portal-auth";
import { csvEscape, gradeFor, numberInRange } from "../../../lib/school-utils";

export async function GET(request: Request) {
  const user = await requireApiRole(request, ["admin", "teacher", "student"]);
  if (user instanceof Response) return user;
  const url = new URL(request.url);
  const termId = Number(url.searchParams.get("termId"));
  const classId = Number(url.searchParams.get("classId"));
  const format = url.searchParams.get("format");
  const db = getDb();

  const conditions = [];
  if (termId) conditions.push(eq(resultRecords.termId, termId));
  if (classId) conditions.push(eq(resultRecords.classId, classId));
  if (user.role === "student") conditions.push(eq(resultRecords.studentEmail, user.email), eq(resultRecords.status, "approved"));
  if (user.role === "teacher") {
    const assigned = await db.select({ subjectId: teacherAssignments.subjectId }).from(teacherAssignments).where(eq(teacherAssignments.teacherEmail, user.email));
    if (assigned.length) conditions.push(inArray(resultRecords.subjectId, [...new Set(assigned.map((row) => row.subjectId))]));
    else conditions.push(eq(resultRecords.enteredBy, user.email));
  }

  const rows = await db.select({ id: resultRecords.id, studentEmail: resultRecords.studentEmail, studentName: portalUsers.displayName, subjectId: resultRecords.subjectId, subjectName: subjects.name, classId: resultRecords.classId, className: schoolClasses.name, termId: resultRecords.termId, termName: academicTerms.name, caScore: resultRecords.caScore, examScore: resultRecords.examScore, total: resultRecords.total, grade: resultRecords.grade, teacherComment: resultRecords.teacherComment, status: resultRecords.status }).from(resultRecords).leftJoin(portalUsers, eq(resultRecords.studentEmail, portalUsers.email)).leftJoin(subjects, eq(resultRecords.subjectId, subjects.id)).leftJoin(schoolClasses, eq(resultRecords.classId, schoolClasses.id)).leftJoin(academicTerms, eq(resultRecords.termId, academicTerms.id)).where(conditions.length ? and(...conditions) : undefined).orderBy(asc(portalUsers.displayName), asc(subjects.name));
  const cards = user.role === "student" ? await db.select().from(reportCards).where(and(eq(reportCards.studentEmail, user.email), termId ? eq(reportCards.termId, termId) : undefined)) : [];

  if (format === "csv") {
    const csv = [["Student", "Subject", "Class", "Term", "CA", "Exam", "Total", "Grade", "Status"], ...rows.map((row) => [row.studentName || row.studentEmail, row.subjectName, row.className, row.termName, row.caScore, row.examScore, row.total, row.grade, row.status])].map((row) => row.map(csvEscape).join(",")).join("\r\n");
    return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename=results.csv" } });
  }
  return Response.json({ results: rows, reportCards: cards });
}

export async function POST(request: Request) {
  const user = await requireApiRole(request, ["admin", "teacher"]);
  if (user instanceof Response) return user;
  try {
    const payload = (await request.json()) as { action?: string; classId?: number; subjectId?: number; termId?: number; entries?: { studentEmail?: string; caScore?: number; examScore?: number; teacherComment?: string }[]; studentEmail?: string; teacherComment?: string; principalComment?: string; status?: "draft" | "submitted" | "approved" };
    const action = String(payload.action || "scores.save");
    const db = getDb();
    if (action === "report.approve") {
      if (user.role !== "admin") return Response.json({ error: "Only administrators can approve report cards." }, { status: 403 });
      const classId = Number(payload.classId), termId = Number(payload.termId);
      const studentEmail = String(payload.studentEmail || "").toLowerCase();
      if (!classId || !termId || !studentEmail) return Response.json({ error: "Student, class and term are required." }, { status: 400 });
      const value = { studentEmail, classId, termId, teacherComment: String(payload.teacherComment || ""), principalComment: String(payload.principalComment || ""), status: "approved" as const, approvedBy: user.email, updatedAt: new Date().toISOString() };
      await db.insert(reportCards).values(value).onConflictDoUpdate({ target: [reportCards.studentEmail, reportCards.termId], set: value });
      await db.update(resultRecords).set({ status: "approved", updatedAt: sql`CURRENT_TIMESTAMP` }).where(and(eq(resultRecords.studentEmail, studentEmail), eq(resultRecords.termId, termId)));
      return Response.json({ approved: true });
    }

    const classId = Number(payload.classId), subjectId = Number(payload.subjectId), termId = Number(payload.termId);
    const entries = Array.isArray(payload.entries) ? payload.entries : [];
    if (!classId || !subjectId || !termId || !entries.length) return Response.json({ error: "Class, subject, term and scores are required." }, { status: 400 });
    if (user.role === "teacher") {
      const [assigned] = await db.select().from(teacherAssignments).where(and(eq(teacherAssignments.teacherEmail, user.email), eq(teacherAssignments.classId, classId), eq(teacherAssignments.subjectId, subjectId))).limit(1);
      if (!assigned) return Response.json({ error: "This class and subject are not assigned to you." }, { status: 403 });
    }
    for (const entry of entries) {
      const studentEmail = String(entry.studentEmail || "").toLowerCase();
      if (!studentEmail) continue;
      const caScore = numberInRange(entry.caScore, 0, 40, 0), examScore = numberInRange(entry.examScore, 0, 60, 0), total = caScore + examScore;
      const value = { studentEmail, subjectId, classId, termId, caScore, examScore, total, grade: gradeFor(total), teacherComment: String(entry.teacherComment || ""), status: payload.status === "submitted" ? "submitted" as const : "draft" as const, enteredBy: user.email, updatedAt: new Date().toISOString() };
      await db.insert(resultRecords).values(value).onConflictDoUpdate({ target: [resultRecords.studentEmail, resultRecords.subjectId, resultRecords.termId], set: value });
    }
    return Response.json({ saved: entries.length }, { status: 201 });
  } catch {
    return Response.json({ error: "Results could not be saved." }, { status: 500 });
  }
}
