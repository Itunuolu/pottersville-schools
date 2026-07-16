import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { attendanceRecords, portalUsers, schoolClasses, teacherAssignments } from "../../../db/schema";
import { requireApiRole } from "../../../lib/portal-auth";
import { csvEscape, dateOnly } from "../../../lib/school-utils";

export async function GET(request: Request) {
  const user = await requireApiRole(request, ["admin", "teacher", "student"]);
  if (user instanceof Response) return user;
  const url = new URL(request.url);
  const format = url.searchParams.get("format");
  const classId = Number(url.searchParams.get("classId"));
  const date = url.searchParams.get("date") || dateOnly();
  const db = getDb();

  if (user.role === "student") {
    const rows = await db.select().from(attendanceRecords).where(eq(attendanceRecords.studentEmail, user.email)).orderBy(desc(attendanceRecords.date)).limit(120);
    if (format === "csv") return csvResponse(["Date", "Status", "Note"], rows.map((row) => [row.date, row.status, row.note]), "my-attendance.csv");
    return Response.json({ records: rows });
  }

  let allowedClassIds: number[] | null = null;
  if (user.role === "teacher") {
    const assigned = await db.select({ classId: teacherAssignments.classId }).from(teacherAssignments).where(eq(teacherAssignments.teacherEmail, user.email));
    allowedClassIds = [...new Set(assigned.map((row) => row.classId))];
  }
  if (classId && allowedClassIds && !allowedClassIds.includes(classId)) return Response.json({ error: "This class is not assigned to you." }, { status: 403 });

  const students = classId
    ? await db.select({ email: portalUsers.email, displayName: portalUsers.displayName, className: portalUsers.className }).from(portalUsers).innerJoin(schoolClasses, eq(portalUsers.className, schoolClasses.name)).where(and(eq(portalUsers.role, "student"), eq(schoolClasses.id, classId)))
    : [];
  const records = classId
    ? await db.select().from(attendanceRecords).where(and(eq(attendanceRecords.classId, classId), eq(attendanceRecords.date, date)))
    : allowedClassIds?.length
      ? await db.select().from(attendanceRecords).where(inArray(attendanceRecords.classId, allowedClassIds)).orderBy(desc(attendanceRecords.date)).limit(250)
      : await db.select().from(attendanceRecords).orderBy(desc(attendanceRecords.date)).limit(250);

  if (format === "csv") return csvResponse(["Student", "Date", "Status", "Note", "Marked by"], records.map((row) => [row.studentEmail, row.date, row.status, row.note, row.markedBy]), "attendance-report.csv");
  return Response.json({ students, records, date });
}

export async function POST(request: Request) {
  const user = await requireApiRole(request, ["admin", "teacher"]);
  if (user instanceof Response) return user;
  try {
    const payload = (await request.json()) as { classId?: number; date?: string; entries?: { studentEmail?: string; status?: "present" | "absent" | "late" | "excused"; note?: string }[] };
    const classId = Number(payload.classId);
    const date = String(payload.date || dateOnly());
    const entries = Array.isArray(payload.entries) ? payload.entries : [];
    if (!classId || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !entries.length) return Response.json({ error: "Class, date and student attendance are required." }, { status: 400 });

    const db = getDb();
    if (user.role === "teacher") {
      const [assigned] = await db.select().from(teacherAssignments).where(and(eq(teacherAssignments.teacherEmail, user.email), eq(teacherAssignments.classId, classId))).limit(1);
      if (!assigned) return Response.json({ error: "This class is not assigned to you." }, { status: 403 });
    }
    const validStatuses = new Set(["present", "absent", "late", "excused"]);
    const values = entries.filter((entry) => entry.studentEmail && entry.status && validStatuses.has(entry.status)).map((entry) => ({ classId, studentEmail: String(entry.studentEmail).toLowerCase(), date, status: entry.status!, note: String(entry.note || "").slice(0, 180), markedBy: user.email, updatedAt: new Date().toISOString() }));
    if (!values.length) return Response.json({ error: "No valid attendance entries were provided." }, { status: 400 });
    for (const value of values) await db.insert(attendanceRecords).values(value).onConflictDoUpdate({ target: [attendanceRecords.studentEmail, attendanceRecords.date], set: { classId, status: value.status, note: value.note, markedBy: user.email, updatedAt: value.updatedAt } });
    return Response.json({ saved: values.length, date }, { status: 201 });
  } catch {
    return Response.json({ error: "Attendance could not be saved." }, { status: 500 });
  }
}

function csvResponse(headers: string[], rows: unknown[][], fileName: string) {
  const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\r\n");
  return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="${fileName}"` } });
}
