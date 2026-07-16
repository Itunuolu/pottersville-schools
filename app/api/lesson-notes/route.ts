import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { lessonNotes } from "../../../db/schema";
import { apiError, getPlatformEnv, safeFileName } from "../../../lib/platform";
import { requireApiRole } from "../../../lib/portal-auth";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

export async function GET(request: Request) {
  const user = await requireApiRole(request, ["admin", "teacher", "student"]);
  if (user instanceof Response) return user;

  try {
    const visibility = user.role === "student"
      ? and(eq(lessonNotes.published, true), eq(lessonNotes.className, user.className || "__unassigned__"))
      : user.role === "teacher" ? eq(lessonNotes.uploadedBy, user.email) : undefined;
    const rows = await getDb()
      .select({
        id: lessonNotes.id,
        title: lessonNotes.title,
        description: lessonNotes.description,
        subject: lessonNotes.subject,
        className: lessonNotes.className,
        termId: lessonNotes.termId,
        week: lessonNotes.week,
        topic: lessonNotes.topic,
        published: lessonNotes.published,
        fileName: lessonNotes.fileName,
        fileSize: lessonNotes.fileSize,
        createdAt: lessonNotes.createdAt,
      })
      .from(lessonNotes)
      .where(visibility)
      .orderBy(desc(lessonNotes.createdAt), desc(lessonNotes.id));

    return Response.json({ notes: rows });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  const user = await requireApiRole(request, ["admin", "teacher"]);
  if (user instanceof Response) return user;

  let uploadedKey: string | null = null;

  try {
    const form = await request.formData();
    const title = String(form.get("title") ?? "").trim();
    const subject = String(form.get("subject") ?? "").trim();
    const className = String(form.get("className") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const file = form.get("file");

    if (!title || !subject || !className) {
      return Response.json({ error: "Title, subject and class are required." }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return Response.json({ error: "Choose a PDF lesson note to upload." }, { status: 400 });
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return Response.json({ error: "Lesson notes must be uploaded as PDF files." }, { status: 415 });
    }
    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return Response.json({ error: "The PDF must be smaller than 8 MB." }, { status: 413 });
    }

    const { LESSON_FILES } = getPlatformEnv();
    uploadedKey = `lesson-notes/${crypto.randomUUID()}.pdf`;
    await LESSON_FILES.put(uploadedKey, await file.arrayBuffer(), {
      httpMetadata: { contentType: "application/pdf" },
      customMetadata: { originalName: safeFileName(file.name), uploadedBy: user.email },
    });

    const [note] = await getDb()
      .insert(lessonNotes)
      .values({
        title,
        subject,
        className,
        termId: Number(form.get("termId")) || null,
        week: Number(form.get("week")) || null,
        topic: String(form.get("topic") || "").trim(),
        description,
        fileKey: uploadedKey,
        fileName: safeFileName(file.name),
        fileSize: file.size,
        uploadedBy: user.email,
      })
      .returning({
        id: lessonNotes.id,
        title: lessonNotes.title,
        description: lessonNotes.description,
        subject: lessonNotes.subject,
        className: lessonNotes.className,
        termId: lessonNotes.termId,
        week: lessonNotes.week,
        topic: lessonNotes.topic,
        published: lessonNotes.published,
        fileName: lessonNotes.fileName,
        fileSize: lessonNotes.fileSize,
        createdAt: lessonNotes.createdAt,
      });

    return Response.json({ note }, { status: 201 });
  } catch (error) {
    if (uploadedKey) {
      try { await getPlatformEnv().LESSON_FILES.delete(uploadedKey); } catch { /* best-effort cleanup */ }
    }
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  const user = await requireApiRole(request, ["admin", "teacher"]);
  if (user instanceof Response) return user;
  try {
    const payload = (await request.json()) as { id?: number; title?: string; description?: string; subject?: string; className?: string; topic?: string; week?: number; termId?: number; published?: boolean };
    const id = Number(payload.id);
    if (!id) return Response.json({ error: "Invalid lesson note." }, { status: 400 });
    const db = getDb();
    const [existing] = await db.select().from(lessonNotes).where(eq(lessonNotes.id, id)).limit(1);
    if (!existing || (user.role === "teacher" && existing.uploadedBy !== user.email)) return Response.json({ error: "You cannot edit this lesson note." }, { status: 403 });
    const [note] = await db.update(lessonNotes).set({ title: payload.title?.trim() || existing.title, description: payload.description?.trim() ?? existing.description, subject: payload.subject?.trim() || existing.subject, className: payload.className?.trim() || existing.className, topic: payload.topic?.trim() ?? existing.topic, week: Number(payload.week) || existing.week, termId: Number(payload.termId) || existing.termId, published: typeof payload.published === "boolean" ? payload.published : existing.published }).where(eq(lessonNotes.id, id)).returning();
    return Response.json({ note });
  } catch (error) { return apiError(error); }
}

export async function DELETE(request: Request) {
  const user = await requireApiRole(request, ["admin", "teacher"]);
  if (user instanceof Response) return user;
  try {
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!id) return Response.json({ error: "Invalid lesson note." }, { status: 400 });
    const db = getDb();
    const [existing] = await db.select().from(lessonNotes).where(eq(lessonNotes.id, id)).limit(1);
    if (!existing || (user.role === "teacher" && existing.uploadedBy !== user.email)) return Response.json({ error: "You cannot delete this lesson note." }, { status: 403 });
    await getPlatformEnv().LESSON_FILES.delete(existing.fileKey);
    await db.delete(lessonNotes).where(eq(lessonNotes.id, id));
    return Response.json({ deleted: true });
  } catch (error) { return apiError(error); }
}
