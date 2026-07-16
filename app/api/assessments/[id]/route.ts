import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { assessments, questions } from "../../../../db/schema";
import { apiError } from "../../../../lib/platform";
import { requireApiRole } from "../../../../lib/portal-auth";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireApiRole(request, ["admin", "teacher", "student"]);
  if (user instanceof Response) return user;

  try {
    const { id } = await context.params;
    const assessmentId = Number.parseInt(id, 10);
    if (!Number.isInteger(assessmentId) || assessmentId < 1) {
      return Response.json({ error: "Invalid assessment." }, { status: 400 });
    }

    const db = getDb();
    const [assessment] = await db
      .select({
        id: assessments.id,
        title: assessments.title,
        description: assessments.description,
        assessmentType: assessments.assessmentType,
        subject: assessments.subject,
        className: assessments.className,
        durationMinutes: assessments.durationMinutes,
        passMark: assessments.passMark,
        opensAt: assessments.opensAt,
        closesAt: assessments.closesAt,
        attemptLimit: assessments.attemptLimit,
        randomizeQuestions: assessments.randomizeQuestions,
        status: assessments.status,
      })
      .from(assessments)
      .where(eq(assessments.id, assessmentId))
      .limit(1);

    if (!assessment) return Response.json({ error: "Assessment not found." }, { status: 404 });
    if (user.role === "student" && assessment.className !== user.className) {
      return Response.json({ error: "This assessment is not assigned to your class." }, { status: 403 });
    }
    if (user.role === "student") {
      const now = Date.now();
      if (assessment.status !== "published" || (assessment.opensAt && new Date(assessment.opensAt).getTime() > now) || (assessment.closesAt && new Date(assessment.closesAt).getTime() < now)) return Response.json({ error: "This assessment is not currently open." }, { status: 403 });
    }

    const rows = await db
      .select({ id: questions.id, prompt: questions.prompt, optionsJson: questions.optionsJson, points: questions.points })
      .from(questions)
      .where(eq(questions.assessmentId, assessmentId))
      .orderBy(asc(questions.position));

    const visibleRows = user.role === "student" && assessment.randomizeQuestions ? [...rows].sort(() => Math.random() - 0.5) : rows;
    return Response.json({
      assessment: {
        ...assessment,
        questions: visibleRows.map((question) => ({ ...question, options: JSON.parse(question.optionsJson) as string[], optionsJson: undefined })),
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
