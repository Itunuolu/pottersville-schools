import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const lessonNotes = sqliteTable(
  "lesson_notes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    subject: text("subject").notNull(),
    className: text("class_name").notNull(),
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
