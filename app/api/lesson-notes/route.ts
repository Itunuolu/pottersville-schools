import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { lessonNotes } from "../../../db/schema";
import { apiError, getPlatformEnv, requireRequestUser, safeFileName } from "../../../lib/platform";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

export async function GET(request: Request) {
  const user = requireRequestUser(request);
  if (user instanceof Response) return user;

  try {
    const rows = await getDb()
      .select({
        id: lessonNotes.id,
        title: lessonNotes.title,
        description: lessonNotes.description,
        subject: lessonNotes.subject,
        className: lessonNotes.className,
        fileName: lessonNotes.fileName,
        fileSize: lessonNotes.fileSize,
        createdAt: lessonNotes.createdAt,
      })
      .from(lessonNotes)
      .where(eq(lessonNotes.published, true))
      .orderBy(desc(lessonNotes.createdAt), desc(lessonNotes.id));

    return Response.json({ notes: rows });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  const user = requireRequestUser(request);
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
      customMetadata: { originalName: safeFileName(file.name), uploadedBy: user },
    });

    const [note] = await getDb()
      .insert(lessonNotes)
      .values({
        title,
        subject,
        className,
        description,
        fileKey: uploadedKey,
        fileName: safeFileName(file.name),
        fileSize: file.size,
        uploadedBy: user,
      })
      .returning({
        id: lessonNotes.id,
        title: lessonNotes.title,
        description: lessonNotes.description,
        subject: lessonNotes.subject,
        className: lessonNotes.className,
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
