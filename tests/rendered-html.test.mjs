import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("teacher dashboard includes both learning workflows", async () => {
  const [page, studio, schema] = await Promise.all([
    readFile(new URL("app/teacher/TeacherDashboard.tsx", root), "utf8"),
    readFile(new URL("app/components/LearningStudio.tsx", root), "utf8"),
    readFile(new URL("db/schema.ts", root), "utf8"),
  ]);

  assert.match(page, /<LearningStudio \/>/);
  assert.match(page, /Lesson notes/);
  assert.match(page, /Quizzes & exams/);
  assert.match(studio, /Upload a lesson note/);
  assert.match(studio, /Create a quiz or exam/);
  assert.match(studio, /application\/pdf/);
  assert.match(schema, /lessonNotes/);
  assert.match(schema, /assessments/);
  assert.match(schema, /questions/);
  assert.match(schema, /attempts/);
});

test("student portal supports PDF actions and immediate scoring", async () => {
  const [studentPage, submitRoute, fileRoute] = await Promise.all([
    readFile(new URL("app/student/StudentDashboard.tsx", root), "utf8"),
    readFile(new URL("app/api/assessments/[id]/submit/route.ts", root), "utf8"),
    readFile(new URL("app/api/lesson-notes/[id]/file/route.ts", root), "utf8"),
  ]);

  assert.match(studentPage, /Download PDF/);
  assert.match(studentPage, />Print</);
  assert.match(studentPage, /Your score is ready/);
  assert.match(submitRoute, /percentage/);
  assert.match(submitRoute, /correctOption/);
  assert.match(fileRoute, /content-disposition/);
  await access(new URL("drizzle/0000_optimal_cassandra_nova.sql", root));
});

test("assessment builder supports validated CSV and Excel question imports", async () => {
  const [importer, studio, template, packageJson] = await Promise.all([
    readFile(new URL("app/components/ExamQuestionImporter.tsx", root), "utf8"),
    readFile(new URL("app/components/LearningStudio.tsx", root), "utf8"),
    readFile(new URL("public/exam-question-template.csv", root), "utf8"),
    readFile(new URL("package.json", root), "utf8"),
  ]);

  assert.match(importer, /\.csv/);
  assert.match(importer, /\.xlsx/);
  assert.match(importer, /Missing required column/);
  assert.match(importer, /correct answer must be A–D or match an option exactly/);
  assert.match(importer, /Only the first 50 questions/);
  assert.match(studio, /<ExamQuestionImporter/);
  assert.match(template, /^Question,Option A,Option B,Option C,Option D,Correct Answer,Marks/m);
  assert.match(packageJson, /"read-excel-file"/);
});

test("school authentication has protected roles and admin-controlled access", async () => {
  const [auth, adminApi, teacherPage, studentPage, loginPage, schema, migration] = await Promise.all([
    readFile(new URL("lib/portal-auth.ts", root), "utf8"),
    readFile(new URL("app/api/admin/users/route.ts", root), "utf8"),
    readFile(new URL("app/teacher/page.tsx", root), "utf8"),
    readFile(new URL("app/student/page.tsx", root), "utf8"),
    readFile(new URL("app/login/page.tsx", root), "utf8"),
    readFile(new URL("db/schema.ts", root), "utf8"),
    readFile(new URL("drizzle/0001_sad_vapor.sql", root), "utf8"),
  ]);

  assert.match(auth, /requirePortalRole/);
  assert.match(auth, /requireApiRole/);
  assert.match(auth, /bootstrapFirstAdmin/);
  assert.match(adminApi, /You cannot remove your own administrator access/);
  assert.match(teacherPage, /\["teacher", "admin"\]/);
  assert.match(studentPage, /\["student", "teacher", "admin"\]/);
  assert.match(loginPage, /\/signin-with-chatgpt/);
  assert.match(schema, /portalUsers/);
  assert.match(schema, /accessAuditLogs/);
  assert.match(migration, /CREATE TABLE `portal_users`/);
  assert.match(migration, /CREATE TABLE `access_audit_logs`/);
});

test("role checks guard every content mutation", async () => {
  const [lessonRoute, assessmentRoute, submitRoute] = await Promise.all([
    readFile(new URL("app/api/lesson-notes/route.ts", root), "utf8"),
    readFile(new URL("app/api/assessments/route.ts", root), "utf8"),
    readFile(new URL("app/api/assessments/[id]/submit/route.ts", root), "utf8"),
  ]);
  assert.match(lessonRoute, /requireApiRole\(request, \["admin", "teacher"\]\)/);
  assert.match(assessmentRoute, /requireApiRole\(request, \["admin", "teacher"\]\)/);
  assert.match(submitRoute, /requireApiRole\(request, \["student"\]\)/);
  assert.match(submitRoute, /assessment\.className !== user\.className/);
});

test("owner recovery prevents an administrator activation dead end", async () => {
  const [auth, migration] = await Promise.all([
    readFile(new URL("lib/portal-auth.ts", root), "utf8"),
    readFile(new URL("drizzle/0002_recover-owner-admin.sql", root), "utf8"),
  ]);

  assert.match(auth, /where\(eq\(portalUsers\.role, "admin"\)\)/);
  assert.match(auth, /Recovery rule: a school must never be left without an administrator/);
  assert.match(auth, /role: "admin"/);
  assert.match(migration, /itunuoluwaakinkugbe@gmail\.com/);
  assert.match(migration, /ON CONFLICT\(`email`\) DO UPDATE SET/);
  assert.match(migration, /`role` = 'admin'/);
  assert.match(migration, /`status` = 'active'/);
});

test("complete school operations share one academic data model", async () => {
  const [schema, schoolApi, operations] = await Promise.all([
    readFile(new URL("db/schema.ts", root), "utf8"),
    readFile(new URL("app/api/school-data/route.ts", root), "utf8"),
    readFile(new URL("app/operations/OperationsPortal.tsx", root), "utf8"),
  ]);
  for (const table of ["academicSessions", "academicTerms", "schoolClasses", "subjects", "teacherAssignments", "timetableEntries", "attendanceRecords", "assignments", "assignmentSubmissions", "resultRecords", "reportCards", "announcements", "schoolEvents", "supportTickets"]) assert.match(schema, new RegExp(table));
  assert.match(schoolApi, /demo\.seed/);
  assert.match(schoolApi, /missingPeople/);
  assert.match(schoolApi, /Inter-house Sports Day/);
  assert.match(operations, /Academic setup/);
  assert.match(operations, /Load investor demo data/);
  assert.match(operations, /Refresh investor demo data/);
  assert.match(operations, /Mark student attendance/);
  assert.match(operations, /Enter CA and examination scores/);
  assert.match(operations, /Create an assignment/);
  assert.match(operations, /Publish an announcement/);
  assert.match(operations, /Ask for help/);
});

test("attendance, results and assignments enforce role and class boundaries", async () => {
  const [attendance, results, assignments] = await Promise.all([
    readFile(new URL("app/api/attendance/route.ts", root), "utf8"),
    readFile(new URL("app/api/results/route.ts", root), "utf8"),
    readFile(new URL("app/api/assignments/route.ts", root), "utf8"),
  ]);
  assert.match(attendance, /This class is not assigned to you/);
  assert.match(attendance, /onConflictDoUpdate/);
  assert.match(results, /Only administrators can approve report cards/);
  assert.match(results, /gradeFor\(total\)/);
  assert.match(assignments, /Only student accounts can submit assignments/);
  assert.match(assignments, /This assignment is not available to your class/);
});

test("lesson and assessment lifecycle supports stakeholder-ready controls", async () => {
  const [lessons, assessment, submit, studio] = await Promise.all([
    readFile(new URL("app/api/lesson-notes/route.ts", root), "utf8"),
    readFile(new URL("app/api/assessments/route.ts", root), "utf8"),
    readFile(new URL("app/api/assessments/[id]/submit/route.ts", root), "utf8"),
    readFile(new URL("app/components/LearningStudio.tsx", root), "utf8"),
  ]);
  assert.match(lessons, /export async function PATCH/);
  assert.match(lessons, /export async function DELETE/);
  assert.match(assessment, /randomizeQuestions/);
  assert.match(assessment, /attemptLimit/);
  assert.match(submit, /used all/);
  assert.match(studio, /Randomize question order/);
  assert.match(studio, /Lesson note deleted/);
});

test("investor presentation flow and bulk onboarding are included", async () => {
  const [tour, importer, userApi] = await Promise.all([
    readFile(new URL("app/tour/page.tsx", root), "utf8"),
    readFile(new URL("app/admin/BulkAccountImporter.tsx", root), "utf8"),
    readFile(new URL("app/api/admin/users/route.ts", root), "utf8"),
  ]);
  assert.match(tour, /The connected school operating system/);
  assert.match(tour, /Complete working flows/);
  assert.match(importer, /\.xlsx/);
  assert.match(importer, /school-accounts-template\.csv/);
  assert.match(userApi, /Import between 1 and 250 accounts/);
});
