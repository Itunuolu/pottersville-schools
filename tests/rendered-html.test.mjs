import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("teacher dashboard includes both learning workflows", async () => {
  const [page, studio, schema] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
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
    readFile(new URL("app/student/page.tsx", root), "utf8"),
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
