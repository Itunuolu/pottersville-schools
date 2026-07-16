import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { announcements, assignmentSubmissions, assignments, attendanceRecords, portalUsers, reportCards, resultRecords, schoolClasses, schoolEvents, subjects, teacherAssignments, timetableEntries } from "../../../db/schema";
import { requireApiRole } from "../../../lib/portal-auth";
import { dateOnly } from "../../../lib/school-utils";

export async function GET(request: Request) {
  const user = await requireApiRole(request, ["admin", "teacher", "student"]);
  if (user instanceof Response) return user;
  const db = getDb();
  const today = dateOnly();
  const dayOfWeek = new Date().getUTCDay();

  if (user.role === "admin") {
    const [[students], [teachers], [classes], [openTickets], [results], [attendance]] = await Promise.all([
      db.select({ value: count() }).from(portalUsers).where(and(eq(portalUsers.role, "student"), eq(portalUsers.status, "active"))),
      db.select({ value: count() }).from(portalUsers).where(and(eq(portalUsers.role, "teacher"), eq(portalUsers.status, "active"))),
      db.select({ value: count() }).from(schoolClasses),
      db.select({ value: count() }).from(reportCards).where(eq(reportCards.status, "submitted")),
      db.select({ value: count() }).from(resultRecords).where(eq(resultRecords.status, "approved")),
      db.select({ value: count() }).from(attendanceRecords).where(eq(attendanceRecords.date, today)),
    ]);
    return Response.json({ role: user.role, stats: { students: students.value, teachers: teachers.value, classes: classes.value, approvals: openTickets.value, approvedResults: results.value, attendanceToday: attendance.value } });
  }

  if (user.role === "teacher") {
    const assigned = await db.select().from(teacherAssignments).where(eq(teacherAssignments.teacherEmail, user.email));
    const classIds = [...new Set(assigned.map((row) => row.classId))];
    const subjectIds = [...new Set(assigned.map((row) => row.subjectId))];
    const classRows = classIds.length ? await db.select().from(schoolClasses).where(inArray(schoolClasses.id, classIds)) : [];
    const classNames = classRows.map((row) => row.name);
    const [students, timetable, pendingResults, dueAssignments, attendanceToday] = await Promise.all([
      classNames.length ? db.select({ value: count() }).from(portalUsers).where(and(eq(portalUsers.role, "student"), inArray(portalUsers.className, classNames))) : Promise.resolve([{ value: 0 }]),
      db.select({ id: timetableEntries.id, startTime: timetableEntries.startTime, endTime: timetableEntries.endTime, room: timetableEntries.room, classId: timetableEntries.classId, subjectId: timetableEntries.subjectId, className: schoolClasses.name, subjectName: subjects.name }).from(timetableEntries).leftJoin(schoolClasses, eq(timetableEntries.classId, schoolClasses.id)).leftJoin(subjects, eq(timetableEntries.subjectId, subjects.id)).where(and(eq(timetableEntries.teacherEmail, user.email), dayOfWeek >= 1 && dayOfWeek <= 5 ? eq(timetableEntries.dayOfWeek, dayOfWeek) : undefined)).orderBy(timetableEntries.startTime),
      subjectIds.length ? db.select({ value: count() }).from(resultRecords).where(and(inArray(resultRecords.subjectId, subjectIds), eq(resultRecords.status, "draft"))) : Promise.resolve([{ value: 0 }]),
      db.select({ value: count() }).from(assignments).where(and(eq(assignments.teacherEmail, user.email), eq(assignments.status, "published"))),
      classIds.length ? db.select({ value: count() }).from(attendanceRecords).where(and(inArray(attendanceRecords.classId, classIds), eq(attendanceRecords.date, today))) : Promise.resolve([{ value: 0 }]),
    ]);
    return Response.json({ role: user.role, stats: { students: students[0].value, assignedClasses: classIds.length, assignedSubjects: subjectIds.length, pendingResults: pendingResults[0].value, activeAssignments: dueAssignments[0].value, attendanceMarked: attendanceToday[0].value }, timetable });
  }

  const [classRow] = await db.select().from(schoolClasses).where(eq(schoolClasses.name, user.className || "__unassigned__")).limit(1);
  const [attendance, results, assignmentRows, submissions, timetable, latestAnnouncements, upcomingEvents] = await Promise.all([
    db.select().from(attendanceRecords).where(eq(attendanceRecords.studentEmail, user.email)).orderBy(desc(attendanceRecords.date)).limit(90),
    db.select().from(resultRecords).where(and(eq(resultRecords.studentEmail, user.email), eq(resultRecords.status, "approved"))).orderBy(desc(resultRecords.updatedAt)),
    classRow ? db.select().from(assignments).where(and(eq(assignments.classId, classRow.id), eq(assignments.status, "published"))).orderBy(desc(assignments.dueAt)) : [],
    db.select().from(assignmentSubmissions).where(eq(assignmentSubmissions.studentEmail, user.email)),
    classRow ? db.select({ id: timetableEntries.id, dayOfWeek: timetableEntries.dayOfWeek, startTime: timetableEntries.startTime, endTime: timetableEntries.endTime, room: timetableEntries.room, subjectName: subjects.name }).from(timetableEntries).leftJoin(subjects, eq(timetableEntries.subjectId, subjects.id)).where(eq(timetableEntries.classId, classRow.id)).orderBy(timetableEntries.dayOfWeek, timetableEntries.startTime) : [],
    db.select().from(announcements).orderBy(desc(announcements.publishedAt)).limit(3),
    db.select().from(schoolEvents).orderBy(schoolEvents.startAt).limit(3),
  ]);
  const present = attendance.filter((row) => row.status === "present" || row.status === "late").length;
  const average = results.length ? Math.round(results.reduce((sum, row) => sum + row.total, 0) / results.length) : 0;
  const submittedIds = new Set(submissions.map((row) => row.assignmentId));
  return Response.json({ role: user.role, stats: { attendanceRate: attendance.length ? Math.round((present / attendance.length) * 100) : 0, average, activeAssignments: assignmentRows.filter((row) => !submittedIds.has(row.id)).length, approvedResults: results.length }, timetable, announcements: latestAnnouncements, events: upcomingEvents });
}
