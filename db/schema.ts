import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const portalUsers = sqliteTable(
  "portal_users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull().unique(),
    displayName: text("display_name").notNull(),
    role: text("role", { enum: ["admin", "teacher", "student"] }).notNull(),
    status: text("status", { enum: ["active", "suspended"] }).notNull().default("active"),
    className: text("class_name"),
    schoolId: text("school_id").notNull().default("PURPLESTARS"),
    createdBy: text("created_by").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("portal_users_role_idx").on(table.role, table.status),
    index("portal_users_class_idx").on(table.className),
  ],
);

export const accessAuditLogs = sqliteTable(
  "access_audit_logs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    actorEmail: text("actor_email").notNull(),
    action: text("action").notNull(),
    targetEmail: text("target_email").notNull(),
    detailJson: text("detail_json").notNull().default("{}"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("access_audit_actor_idx").on(table.actorEmail, table.createdAt)],
);

export const lessonNotes = sqliteTable(
  "lesson_notes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    subject: text("subject").notNull(),
    className: text("class_name").notNull(),
    termId: integer("term_id"),
    week: integer("week"),
    topic: text("topic").notNull().default(""),
    fileKey: text("file_key").notNull().unique(),
    fileName: text("file_name").notNull(),
    fileSize: integer("file_size").notNull(),
    uploadedBy: text("uploaded_by").notNull(),
    published: integer("published", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("lesson_notes_class_idx").on(table.className),
    index("lesson_notes_created_idx").on(table.createdAt),
  ],
);

export const assessments = sqliteTable(
  "assessments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    assessmentType: text("assessment_type", { enum: ["quiz", "exam"] }).notNull(),
    subject: text("subject").notNull(),
    className: text("class_name").notNull(),
    durationMinutes: integer("duration_minutes").notNull().default(15),
    passMark: integer("pass_mark").notNull().default(50),
    opensAt: text("opens_at"),
    closesAt: text("closes_at"),
    attemptLimit: integer("attempt_limit").notNull().default(1),
    randomizeQuestions: integer("randomize_questions", { mode: "boolean" }).notNull().default(false),
    status: text("status", { enum: ["draft", "scheduled", "published", "closed"] }).notNull().default("published"),
    createdBy: text("created_by").notNull(),
    published: integer("published", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("assessments_class_idx").on(table.className),
    index("assessments_created_idx").on(table.createdAt),
  ],
);

export const questions = sqliteTable(
  "questions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    assessmentId: integer("assessment_id").notNull().references(() => assessments.id, { onDelete: "cascade" }),
    prompt: text("prompt").notNull(),
    optionsJson: text("options_json").notNull(),
    correctOption: integer("correct_option").notNull(),
    points: integer("points").notNull().default(1),
    position: integer("position").notNull(),
  },
  (table) => [index("questions_assessment_idx").on(table.assessmentId, table.position)],
);

export const attempts = sqliteTable(
  "attempts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    assessmentId: integer("assessment_id").notNull().references(() => assessments.id, { onDelete: "cascade" }),
    studentEmail: text("student_email").notNull(),
    answersJson: text("answers_json").notNull(),
    score: integer("score").notNull(),
    totalPoints: integer("total_points").notNull(),
    percentage: integer("percentage").notNull(),
    passed: integer("passed", { mode: "boolean" }).notNull(),
    submittedAt: text("submitted_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("attempts_assessment_idx").on(table.assessmentId),
    index("attempts_student_idx").on(table.studentEmail, table.submittedAt),
  ],
);

export const academicSessions = sqliteTable("academic_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  isCurrent: integer("is_current", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const academicTerms = sqliteTable(
  "academic_terms",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    sessionId: integer("session_id").notNull().references(() => academicSessions.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    startDate: text("start_date").notNull(),
    endDate: text("end_date").notNull(),
    isCurrent: integer("is_current", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("academic_terms_session_name_unique").on(table.sessionId, table.name)],
);

export const schoolClasses = sqliteTable("school_classes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  level: text("level").notNull(),
  arm: text("arm").notNull().default(""),
  formTeacherEmail: text("form_teacher_email"),
  capacity: integer("capacity").notNull().default(35),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const subjects = sqliteTable("subjects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  department: text("department").notNull().default("General"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const teacherAssignments = sqliteTable(
  "teacher_assignments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    teacherEmail: text("teacher_email").notNull(),
    subjectId: integer("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
    classId: integer("class_id").notNull().references(() => schoolClasses.id, { onDelete: "cascade" }),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("teacher_assignments_unique").on(table.teacherEmail, table.subjectId, table.classId)],
);

export const timetableEntries = sqliteTable(
  "timetable_entries",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    classId: integer("class_id").notNull().references(() => schoolClasses.id, { onDelete: "cascade" }),
    subjectId: integer("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
    teacherEmail: text("teacher_email").notNull(),
    dayOfWeek: integer("day_of_week").notNull(),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
    room: text("room").notNull().default("Classroom"),
  },
  (table) => [index("timetable_teacher_day_idx").on(table.teacherEmail, table.dayOfWeek), index("timetable_class_day_idx").on(table.classId, table.dayOfWeek)],
);

export const attendanceRecords = sqliteTable(
  "attendance_records",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    classId: integer("class_id").notNull().references(() => schoolClasses.id, { onDelete: "cascade" }),
    studentEmail: text("student_email").notNull(),
    date: text("date").notNull(),
    status: text("status", { enum: ["present", "absent", "late", "excused"] }).notNull(),
    note: text("note").notNull().default(""),
    markedBy: text("marked_by").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("attendance_student_date_unique").on(table.studentEmail, table.date), index("attendance_class_date_idx").on(table.classId, table.date)],
);

export const assignments = sqliteTable(
  "assignments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    subjectId: integer("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
    classId: integer("class_id").notNull().references(() => schoolClasses.id, { onDelete: "cascade" }),
    teacherEmail: text("teacher_email").notNull(),
    dueAt: text("due_at").notNull(),
    maxScore: integer("max_score").notNull().default(10),
    status: text("status", { enum: ["draft", "published", "closed"] }).notNull().default("published"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("assignments_class_due_idx").on(table.classId, table.dueAt)],
);

export const assignmentSubmissions = sqliteTable(
  "assignment_submissions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    assignmentId: integer("assignment_id").notNull().references(() => assignments.id, { onDelete: "cascade" }),
    studentEmail: text("student_email").notNull(),
    content: text("content").notNull().default(""),
    fileKey: text("file_key"),
    fileName: text("file_name"),
    score: real("score"),
    feedback: text("feedback").notNull().default(""),
    status: text("status", { enum: ["submitted", "graded", "returned"] }).notNull().default("submitted"),
    submittedAt: text("submitted_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    gradedAt: text("graded_at"),
  },
  (table) => [uniqueIndex("assignment_student_unique").on(table.assignmentId, table.studentEmail)],
);

export const resultRecords = sqliteTable(
  "result_records",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    studentEmail: text("student_email").notNull(),
    subjectId: integer("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
    classId: integer("class_id").notNull().references(() => schoolClasses.id, { onDelete: "cascade" }),
    termId: integer("term_id").notNull().references(() => academicTerms.id, { onDelete: "cascade" }),
    caScore: real("ca_score").notNull().default(0),
    examScore: real("exam_score").notNull().default(0),
    total: real("total").notNull().default(0),
    grade: text("grade").notNull().default("F"),
    teacherComment: text("teacher_comment").notNull().default(""),
    status: text("status", { enum: ["draft", "submitted", "approved"] }).notNull().default("draft"),
    enteredBy: text("entered_by").notNull(),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("result_student_subject_term_unique").on(table.studentEmail, table.subjectId, table.termId), index("result_class_term_idx").on(table.classId, table.termId)],
);

export const reportCards = sqliteTable(
  "report_cards",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    studentEmail: text("student_email").notNull(),
    classId: integer("class_id").notNull().references(() => schoolClasses.id, { onDelete: "cascade" }),
    termId: integer("term_id").notNull().references(() => academicTerms.id, { onDelete: "cascade" }),
    teacherComment: text("teacher_comment").notNull().default(""),
    principalComment: text("principal_comment").notNull().default(""),
    status: text("status", { enum: ["draft", "submitted", "approved"] }).notNull().default("draft"),
    approvedBy: text("approved_by"),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("report_student_term_unique").on(table.studentEmail, table.termId)],
);

export const announcements = sqliteTable(
  "announcements",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    audience: text("audience", { enum: ["all", "teachers", "students", "class"] }).notNull().default("all"),
    classId: integer("class_id").references(() => schoolClasses.id, { onDelete: "cascade" }),
    priority: text("priority", { enum: ["normal", "important", "urgent"] }).notNull().default("normal"),
    publishedBy: text("published_by").notNull(),
    publishedAt: text("published_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("announcements_audience_idx").on(table.audience, table.publishedAt)],
);

export const schoolEvents = sqliteTable("school_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  startAt: text("start_at").notNull(),
  endAt: text("end_at").notNull(),
  location: text("location").notNull().default("School campus"),
  audience: text("audience", { enum: ["all", "teachers", "students"] }).notNull().default("all"),
  createdBy: text("created_by").notNull(),
});

export const supportTickets = sqliteTable(
  "support_tickets",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    subject: text("subject").notNull(),
    category: text("category").notNull().default("General"),
    message: text("message").notNull(),
    status: text("status", { enum: ["open", "in_progress", "resolved"] }).notNull().default("open"),
    priority: text("priority", { enum: ["low", "normal", "high"] }).notNull().default("normal"),
    createdBy: text("created_by").notNull(),
    assignedTo: text("assigned_to"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("tickets_status_idx").on(table.status, table.createdAt)],
);

export const lessonDownloads = sqliteTable("lesson_downloads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lessonNoteId: integer("lesson_note_id").notNull().references(() => lessonNotes.id, { onDelete: "cascade" }),
  studentEmail: text("student_email").notNull(),
  action: text("action", { enum: ["view", "download", "print"] }).notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
