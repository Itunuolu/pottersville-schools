import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { assessments, questions } from "../../../db/schema";
import { apiError } from "../../../lib/platform";
import { requireApiRole } from "../../../lib/portal-auth";

type QuestionInput = {
  prompt?: string;
  options?: string[];
  correctOption?: number;
  points?: number;
};

export async function GET(request: Request) {
  const user = await requireApiRole(request, ["admin", "teacher", "student"]);
  if (user instanceof Response) return user;

  try {
    const db = getDb();
    const visibility = user.role === "student"
      ? and(eq(assessments.published, true), eq(assessments.className, user.className || "__unassigned__"))
      : eq(assessments.published, true);
    const rows = await db
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
        createdAt: assessments.createdAt,
      })
      .from(assessments)
      .where(visibility)
      .orderBy(desc(assessments.createdAt), desc(assessments.id));

    const allQuestions = await db.select({ assessmentId: questions.assessmentId }).from(questions);
    const counts = allQuestions.reduce<Record<number, number>>((map, question) => {
      map[question.assessmentId] = (map[question.assessmentId] ?? 0) + 1;
      return map;
    }, {});

    const now = Date.now();
    const visible = user.role === "student" ? rows.filter((row) => row.status === "published" && (!row.opensAt || new Date(row.opensAt).getTime() <= now) && (!row.closesAt || new Date(row.closesAt).getTime() >= now)) : rows;
    return Response.json({ assessments: visible.map((row) => ({ ...row, questionCount: counts[row.id] ?? 0 })) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  const user = await requireApiRole(request, ["admin", "teacher"]);
  if (user instanceof Response) return user;

  try {
    const payload = (await request.json()) as {
      title?: string;
      description?: string;
      assessmentType?: "quiz" | "exam";
      subject?: string;
      className?: string;
      durationMinutes?: number;
      passMark?: number;
      opensAt?: string;
      closesAt?: string;
      attemptLimit?: number;
      randomizeQuestions?: boolean;
      status?: "draft" | "scheduled" | "published" | "closed";
      questions?: QuestionInput[];
    };

    const title = payload.title?.trim() ?? "";
    const subject = payload.subject?.trim() ?? "";
    const className = payload.className?.trim() ?? "";
    const assessmentType = payload.assessmentType === "exam" ? "exam" : "quiz";
    const durationMinutes = Math.min(180, Math.max(1, Math.round(Number(payload.durationMinutes) || 15)));
    const passMark = Math.min(100, Math.max(0, Math.round(Number(payload.passMark) || 50)));
    const questionInputs = Array.isArray(payload.questions) ? payload.questions : [];

    if (!title || !subject || !className) {
      return Response.json({ error: "Title, subject and class are required." }, { status: 400 });
    }
    if (questionInputs.length < 1 || questionInputs.length > 50) {
      return Response.json({ error: "Add between 1 and 50 questions." }, { status: 400 });
    }

    const normalizedQuestions = questionInputs.map((question, index) => {
      const prompt = question.prompt?.trim() ?? "";
      const options = Array.isArray(question.options) ? question.options.map((option) => option.trim()) : [];
      const correctOption = Number(question.correctOption);
      const points = Math.min(20, Math.max(1, Math.round(Number(question.points) || 1)));

      if (!prompt || options.length < 2 || options.length > 6 || options.some((option) => !option)) {
        throw new Error(`Question ${index + 1} needs a prompt and 2–6 complete answer options.`);
      }
      if (!Number.isInteger(correctOption) || correctOption < 0 || correctOption >= options.length) {
        throw new Error(`Choose the correct answer for question ${index + 1}.`);
      }

      return { prompt, options, correctOption, points };
    });

    const db = getDb();
    const [assessment] = await db
      .insert(assessments)
      .values({
        title,
        description: payload.description?.trim() ?? "",
        assessmentType,
        subject,
        className,
        durationMinutes,
        passMark,
        opensAt: payload.opensAt || null,
        closesAt: payload.closesAt || null,
        attemptLimit: Math.min(10, Math.max(1, Math.round(Number(payload.attemptLimit) || 1))),
        randomizeQuestions: Boolean(payload.randomizeQuestions),
        status: ["draft", "scheduled", "published", "closed"].includes(String(payload.status)) ? payload.status! : "published",
        createdBy: user.email,
      })
      .returning();

    await db.insert(questions).values(
      normalizedQuestions.map((question, position) => ({
        assessmentId: assessment.id,
        prompt: question.prompt,
        optionsJson: JSON.stringify(question.options),
        correctOption: question.correctOption,
        points: question.points,
        position,
      })),
    );

    return Response.json({ assessment: { ...assessment, questionCount: normalizedQuestions.length } }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message.startsWith("Question") || error.message.startsWith("Choose"))) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return apiError(error);
  }
}
