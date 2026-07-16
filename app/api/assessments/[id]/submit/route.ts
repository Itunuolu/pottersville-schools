import { and, asc, count, eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { assessments, attempts, questions } from "../../../../../db/schema";
import { apiError } from "../../../../../lib/platform";
import { requireApiRole } from "../../../../../lib/portal-auth";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireApiRole(request, ["student"]);
  if (user instanceof Response) return user;

  try {
    const { id } = await context.params;
    const assessmentId = Number.parseInt(id, 10);
    const payload = (await request.json()) as { answers?: Record<string, number> };
    if (!Number.isInteger(assessmentId) || assessmentId < 1 || !payload.answers || typeof payload.answers !== "object") {
      return Response.json({ error: "Your answers could not be submitted." }, { status: 400 });
    }

    const db = getDb();
    const [assessment] = await db
      .select({ id: assessments.id, passMark: assessments.passMark, className: assessments.className, status: assessments.status, opensAt: assessments.opensAt, closesAt: assessments.closesAt, attemptLimit: assessments.attemptLimit })
      .from(assessments)
      .where(eq(assessments.id, assessmentId))
      .limit(1);
    if (!assessment) return Response.json({ error: "Assessment not found." }, { status: 404 });
    if (assessment.className !== user.className) {
      return Response.json({ error: "This assessment is not assigned to your class." }, { status: 403 });
    }
    const now = Date.now();
    if (assessment.status !== "published" || (assessment.opensAt && new Date(assessment.opensAt).getTime() > now) || (assessment.closesAt && new Date(assessment.closesAt).getTime() < now)) return Response.json({ error: "This assessment is not currently open." }, { status: 403 });
    const [{ value: attemptCount }] = await db.select({ value: count() }).from(attempts).where(and(eq(attempts.assessmentId, assessmentId), eq(attempts.studentEmail, user.email)));
    if (attemptCount >= assessment.attemptLimit) return Response.json({ error: `You have used all ${assessment.attemptLimit} allowed attempt${assessment.attemptLimit === 1 ? "" : "s"}.` }, { status: 409 });

    const rows = await db
      .select({ id: questions.id, correctOption: questions.correctOption, points: questions.points })
      .from(questions)
      .where(eq(questions.assessmentId, assessmentId))
      .orderBy(asc(questions.position));
    if (!rows.length) return Response.json({ error: "This assessment has no questions." }, { status: 409 });

    const totalPoints = rows.reduce((sum, question) => sum + question.points, 0);
    const score = rows.reduce((sum, question) => {
      const selected = Number(payload.answers?.[String(question.id)]);
      return sum + (selected === question.correctOption ? question.points : 0);
    }, 0);
    const percentage = totalPoints ? Math.round((score / totalPoints) * 100) : 0;
    const passed = percentage >= assessment.passMark;

    const [attempt] = await db
      .insert(attempts)
      .values({
        assessmentId,
        studentEmail: user.email,
        answersJson: JSON.stringify(payload.answers),
        score,
        totalPoints,
        percentage,
        passed,
      })
      .returning({ id: attempts.id, submittedAt: attempts.submittedAt });

    return Response.json({ result: { attemptId: attempt.id, score, totalPoints, percentage, passed, submittedAt: attempt.submittedAt } }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
