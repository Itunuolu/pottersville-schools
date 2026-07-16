import { eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { lessonNotes } from "../../../../../db/schema";
import { apiError, getPlatformEnv, safeFileName } from "../../../../../lib/platform";
import { requireApiRole } from "../../../../../lib/portal-auth";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireApiRole(request, ["admin", "teacher", "student"]);
  if (user instanceof Response) return user;

  try {
    const { id } = await context.params;
    const noteId = Number.parseInt(id, 10);
    if (!Number.isInteger(noteId) || noteId < 1) {
      return Response.json({ error: "Invalid lesson note." }, { status: 400 });
    }

    const [note] = await getDb()
      .select({ fileKey: lessonNotes.fileKey, fileName: lessonNotes.fileName, className: lessonNotes.className })
      .from(lessonNotes)
      .where(eq(lessonNotes.id, noteId))
      .limit(1);

    if (!note) return Response.json({ error: "Lesson note not found." }, { status: 404 });
    if (user.role === "student" && note.className !== user.className) {
      return Response.json({ error: "This lesson note is not assigned to your class." }, { status: 403 });
    }

    const object = await getPlatformEnv().LESSON_FILES.get(note.fileKey);
    if (!object) return Response.json({ error: "Lesson file not found." }, { status: 404 });

    const url = new URL(request.url);
    const disposition = url.searchParams.get("download") === "1" ? "attachment" : "inline";
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("content-type", "application/pdf");
    headers.set("content-disposition", `${disposition}; filename="${safeFileName(note.fileName)}"`);
    headers.set("etag", object.httpEtag);
    headers.set("cache-control", "private, max-age=300");

    return new Response(object.body, { headers });
  } catch (error) {
    return apiError(error);
  }
}
